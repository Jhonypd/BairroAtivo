import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
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
    const androidBlockEnd = "\n}\n\n// Apply static values from 'android.packagingOptions'";
    const markerIndex = contents.indexOf(androidBlockEnd);
    if (markerIndex < 0) {
      throw new Error("Não encontrei o final do bloco android em android/app/build.gradle.");
    }

    contents =
      contents.slice(0, markerIndex) +
      "\n    externalNativeBuild {\n        cmake {\n            buildStagingDirectory new File(System.getProperty('java.io.tmpdir'), 'bairroativo-cmake')\n        }\n    }" +
      contents.slice(markerIndex);
  }

  writeFileSync(gradleFile, contents);
}

function hasGoogleMapsApiKey() {
  if (process.env.GOOGLE_MAPS_API_KEY?.trim()) return true;

  const envFile = join(projectRoot, ".env");
  if (!existsSync(envFile)) return false;

  return readFileSync(envFile, "utf8").split(/\r?\n/).some((line) => {
    const match = line.match(/^\s*(?:export\s+)?GOOGLE_MAPS_API_KEY\s*=\s*(.*?)\s*$/);
    if (!match) return false;

    const value = match[1].replace(/^(['"])(.*)\1$/, "$2").trim();
    return value.length > 0 && !value.startsWith("#");
  });
}

if (!hasGoogleMapsApiKey()) {
  console.error(
    "GOOGLE_MAPS_API_KEY não está definido. Adicione a chave do Maps SDK for Android ao .env para compilar o mapa.",
  );
  process.exitCode = 1;
} else if (process.platform !== "win32") {
  process.exitCode = run("npx", ["expo", "run:android", "--device", deviceId], {
    cwd: projectRoot,
  });
} else {
  const driveLetters = [
    "Z",
    "Y",
    "X",
    "W",
    "V",
    "U",
    "T",
    "S",
    "R",
    "Q",
    "P",
    "O",
    "N",
    "M",
    "L",
    "K",
    "J",
    "I",
    "H",
    "G",
    "F",
    "E",
  ];
  const freeLetter = driveLetters.find((letter) => !existsSync(letter + ":\\"));

  if (!freeLetter) {
    console.error(
      "Não encontrei uma unidade livre para encurtar o caminho do projeto.",
    );
    process.exitCode = 1;
  } else if (!existsSync(join(javaHome, "bin", "java.exe"))) {
    console.error(
      "Java não encontrado em " + join(javaHome, "bin", "java.exe") + ".",
    );
    console.error(
      "Defina JAVA_HOME para a pasta do JDK instalado e tente novamente.",
    );
    process.exitCode = 1;
  } else {
    const drive = freeLetter + ":";
    const shortRoot = join(drive + "\\", basename(projectRoot));
    const mapStatus = run("subst", [drive, dirname(projectRoot)]);

    if (mapStatus !== 0) {
      process.exitCode = mapStatus;
    } else {
      try {
        const expoCli = join(shortRoot, "node_modules", "expo", "bin", "cli");
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
        const gradleFile = join(shortRoot, "android", "app", "build.gradle");

        const prebuildStatus = run(
          process.execPath,
          [expoCli, "prebuild", "--platform", "android", "--no-install"],
          { cwd: shortRoot, env },
        );

        if (prebuildStatus !== 0) {
          process.exitCode = prebuildStatus;
        } else {
          configureShortCmakePaths(gradleFile);
          process.exitCode = run(
            process.execPath,
            [expoCli, "run:android", "--device", deviceId],
            { cwd: shortRoot, env },
          );
        }
      } finally {
        run("subst", ["/d", drive]);
      }
    }
  }
}
