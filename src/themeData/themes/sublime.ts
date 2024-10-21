import { EditorTheme } from "../../lib/editor-theme";
import { tags as t } from "@lezer/highlight";

export const sublimeText: EditorTheme = {
  name: "Sublime",
  options: {
    theme: "dark",
    settings: {
      background: "#272822",
      foreground: "#f8f8f2",
      caret: "#f8f8f0",
      selection: "#49483e",
      selectionMatch: "#75715e",
      lineHighlight: "#3e3d32",
      gutterForeground: "#8f908a",
      gutterActiveForeground: "#f8f8f2",
      gutterBackground: "transparent",
      gutterBorder: "transparent",
      fontFamily:
        'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
    },
    styles: [
      {
        tag: [
          t.keyword,
          t.operatorKeyword,
          t.modifier,
          t.color,
          t.constant(t.name),
          t.standard(t.name),
          t.standard(t.tagName),
          t.special(t.brace),
          t.atom,
          t.bool,
          t.special(t.variableName),
        ],
        color: "#66d9ef",
      },
      {
        tag: [t.controlKeyword, t.moduleKeyword],
        color: "#f92672",
      },
      {
        tag: [
          t.name,
          t.deleted,
          t.character,
          t.macroName,
          t.propertyName,
          t.variableName,
          t.labelName,
          t.definition(t.name),
        ],
        color: "#a6e22e",
      },
      { tag: t.heading, fontWeight: "bold", color: "#a6e22e" },
      {
        tag: [
          t.typeName,
          t.className,
          t.tagName,
          t.number,
          t.changed,
          t.annotation,
          t.self,
          t.namespace,
        ],
        color: "#e6db74",
      },
      {
        tag: [t.function(t.variableName), t.function(t.propertyName)],
        color: "#fd971f",
      },
      { tag: [t.number], color: "#ae81ff" },
      {
        tag: [
          t.operator,
          t.punctuation,
          t.separator,
          t.url,
          t.escape,
          t.regexp,
        ],
        color: "#f8f8f2",
      },
      {
        tag: [t.regexp],
        color: "#fd971f",
      },
      {
        tag: [
          t.special(t.string),
          t.processingInstruction,
          t.string,
          t.inserted,
        ],
        color: "#e6db74",
      },
      { tag: [t.angleBracket], color: "#f8f8f2" },
      { tag: t.strong, fontWeight: "bold" },
      { tag: t.emphasis, fontStyle: "italic" },
      { tag: t.strikethrough, textDecoration: "line-through" },
      { tag: [t.meta, t.comment], color: "#75715e" },
      { tag: t.link, color: "#66d9ef", textDecoration: "underline" },
      { tag: t.invalid, color: "#ff0000" },
    ],
  },
};
