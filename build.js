import * as esbuild from "esbuild";

const isWatchMode = process.argv.includes("--watch");

// Build configuration
const buildConfig = {
  entryPoints: ["script.js"],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["es2015"],
  outfile: "script.min.js",
};

const cssBuildConfig = {
  entryPoints: ["styles.css"],
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: "styles.min.css",
};

// Function to generate critical CSS (if you have this functionality)
async function generateCriticalCSS() {
  // Your critical CSS generation logic here
  console.log("✅ Critical CSS generated");
}

if (isWatchMode) {
  buildConfig.watch = {
    onRebuild(error, result) {
      if (error) {
        console.error("❌ JS watch build failed:", error);
      } else {
        console.log("✅ JS watch build succeeded:", result);
      }
    },
  };
  cssBuildConfig.watch = {
    onRebuild(error, result) {
      if (error) {
        console.error("❌ CSS watch build failed:", error);
      } else {
        console.log("✅ CSS watch build succeeded:", result);
      }
    },
  };
}

// Main build process
try {
  await Promise.all([
    esbuild.build(buildConfig),
    esbuild.build(cssBuildConfig),
  ]);
  if (isWatchMode) {
    console.log("👀 Watching for changes in script.js and styles.css...");
  } else {
    console.log(
      "✅ Build successful: script.min.js and styles.min.css have been created.",
    );
    await generateCriticalCSS();
  }
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
