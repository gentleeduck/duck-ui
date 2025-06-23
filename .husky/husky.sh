#!/usr/bin/env sh

# 🧠⚡ Husky x Biome: Pre-commit Wizard 🦆

echo "🧰 [husky] Engaging Duck Mode™..."
echo "🔍 [os-check] Scanning system specs..."

IS_LINUX=false

case "$(uname -s)" in
  Linux*)     IS_LINUX=true ;;
  *)          IS_LINUX=false ;;
esac

if [ "$IS_LINUX" = true ]; then
  RUN="sudo pnpm"
  echo "🐧 [env] Linux OS detected — sudo locked & loaded 🔐"
else
  RUN="pnpm"
  echo "🍏 [env] Non-Linux OS detected — turbo mode enabled 🚀"
fi

echo "🧪 [biome] Initiating hyperspeed lint scan... 🧬"
$RUN biome lint --write ./ 
echo "✅ [biome] Lint diagnostic complete — code is less suspicious 🕵️"

echo "🧼 [biome] Polishing source files with DuckShine™..."
$RUN biome format --write ./ 
echo "✨ [biome] All files formatted with ultra precision 🔍"

echo "🦆💨 [husky] Pre-commit gentelduck™ finished. You may now quack with confidence! ✅"
