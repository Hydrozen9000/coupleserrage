#!/bin/sh
# Clone (sans historique) les outils listés dans README.md. Aucun code n'est exécuté.
cd "$(dirname "$0")" || exit 1
for r in anthropics/skills nextlevelbuilder/ui-ux-pro-max-skill leonxlnx/taste-skill \
 ComposioHQ/awesome-claude-skills wshobson/agents anthropics/claude-plugins-official \
 Graphify-Labs/graphify thedotmack/claude-mem colbymchenry/codegraph yamadashy/repomix \
 OthmanAdi/planning-with-files firecrawl/firecrawl-mcp-server farion1231/cc-switch \
 punkpeye/awesome-mcp-servers multica-ai/multica musistudio/claude-code-router \
 microsoft/playwright-mcp github/github-mcp-server BloopAI/vibe-kanban \
 x1xhlol/system-prompts-and-models-of-ai-tools JuliusBrussee/caveman \
 shanraisshan/claude-code-best-practice openai/codex-plugin-cc jarrodwatts/claude-hud; do
  [ -d "${r#*/}" ] || git clone --depth 1 "https://github.com/$r.git" "${r#*/}"
done
