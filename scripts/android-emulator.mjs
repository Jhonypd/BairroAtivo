import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const deviceId = process.env.ANDROID_EMULATOR_ID ?? "emulator-5554";
const javaHome =
  process.env.JAVA_HOME ?? "C:\\Program Files\\Android\\openjdk\\jdk-21.0.8";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function configureShortCmakePaths(gradleFile) {
  let contents = readFileSync(gradleFile, "utf8");

  if (!contents.includes("-DCMAKE_OBJECT_PATH_MAX=255")) {
    const defaultConfig = "    defaultConfig {";
    if (!contents.includes(defaultConfig)) {
      throw new Error("Não encontrei o bloco defaultConfig em android/app/build.gradle.");
    }

    contents = contents.replace(
      defaultConfig,
      `${defaultConfig}\n        // Keep generated CMake object paths below Windows MAX_PATH.\n        externalNativeBuild {\n            cmake {\n                arguments "-DCMAKE_OBJECT_PATH_MAX=255"\n            }\n        }`,
    );
  }

  if (!contents.includes("bairroativo-cmake")) {
    const androidBlock = /^android\s*\{\s*$/m;
    if (!androidBlock.test(contents)) {
      throw new Error("Não encontrei o início do bloco android em android/app/build.gradle.");
    }

    contents = contents.replace(
      androidBlock,
      (match) => match + "\n    externalNativeBuild {\n        cmake {\n            buildStagingDirectory new File(System.getProperty('java.io.tmpdir'), 'bairroativo-cmake')\n        }\n    }",
    );
  }
  writeFileSync(gradleFile, contents);
}

function verificarDispositivo(deviceId) {
  const androidSdk = process.env.ANDROID_HOME ?? process.env.ANDROID_SDK_ROOT;
  const adbDoSdk = androidSdk
    ? join(androidSdk, "platform-tools", process.platform === "win32" ? "adb.exe" : "adb")
    : "adb";
  const adbCommand = existsSync(adbDoSdk) ? adbDoSdk : "adb";
  const result = spawnSync(adbCommand, ["devices"], { encoding: "utf8" });

  if (result.error || result.status !== 0) {
    console.error("Não consegui consultar o ADB. Confira ANDROID_HOME e platform-tools no PATH.");
    if (result.error) console.error(result.error.message);
    return false;
  }

  const linhas = (result.stdout ?? "").split(/\r?\n/).map((linha) => linha.trim()).filter(Boolean);
  const estadoAlvo = linhas
    .filter((linha) => !linha.startsWith("List of devices"))
    .map((linha) => linha.split(/\s+/))
    .find(([id]) => id === deviceId)?.[1];

  if (estadoAlvo === "device") return true;

  console.error("O dispositivo \"" + deviceId + "\" não está disponível no ADB" + (estadoAlvo ? " (estado: " + estadoAlvo + ")" : "") + ".");
  console.error("Abra o Android Studio > Device Manager, inicie o emulador e aguarde a tela inicial.");
  console.error("Depois confirme no terminal com: adb devices -l");
  console.error("Se o aparelho tiver outro ID, defina ANDROID_EMULATOR_ID com esse ID e tente novamente.");
  return false;
}

if (!verificarDispositivo(deviceId)) {
  process.exitCode = 1;
} else if (process.platform !== "win32") {
  process.exitCode = run("npx", ["expo", "run:android", "--device", deviceId], {
    cwd: projectRoot,
  });
} else if (!existsSync(join(javaHome, "bin", "java.exe"))) {
  console.error("Java não encontrado em " + join(javaHome, "bin", "java.exe") + ".");
  console.error("Defina JAVA_HOME para a pasta do JDK instalado e tente novamente.");
  process.exitCode = 1;
} else {
  const expoCli = join(projectRoot, "node_modules", "expo", "bin", "cli");
  const javaPath = join(javaHome, "bin");
  const env = {
    ...process.env,
    JAVA_HOME: javaHome,
    ComSpec: join(
      process.env.SystemRoot ?? "C:\\Windows",
      "System32",
      "cmd.exe",
    ),
    PATH: [
      dirname(process.execPath),
      join(process.env.SystemRoot ?? "C:\\Windows", "System32"),
      javaPath,
      process.env.PATH ?? "",
    ].join(";"),
    GRADLE_OPTS: [process.env.GRADLE_OPTS, "-Dorg.gradle.daemon=false"]
      .filter(Boolean)
      .join(" "),
  };
  const gradleFile = join(projectRoot, "android", "app", "build.gradle");

  const prebuildStatus = run(
    process.execPath,
    [expoCli, "prebuild", "--platform", "android", "--no-install"],
    { cwd: projectRoot, env },
  );

  if (prebuildStatus !== 0) {
    process.exitCode = prebuildStatus;
  } else {
    configureShortCmakePaths(gradleFile);
    process.exitCode = run(
      process.execPath,
      [expoCli, "run:android", "--device", deviceId],
      { cwd: projectRoot, env },
    );
  }
}
