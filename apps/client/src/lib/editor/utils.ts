import type { SlateEditor } from "components/editor/Editor";
import type { Text } from "components/editor/types";
import { Editor, Transforms, Element as SlateElement } from "slate";

const LIST_TYPES = ["numbered-list", "bulleted-list"];

export function isMarkActive(editor: SlateEditor, format: keyof Omit<Text, "text">) {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}

export function toggleBlock(editor: SlateEditor, format: SlateElement["type"]) {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type),
    split: true,
  });

  const newProperties: Partial<SlateElement> = {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  };
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
}

export function toggleMark(editor: SlateEditor, format: keyof Omit<Text, "text">) {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

export function isBlockActive(editor: SlateEditor, format: SlateElement["type"]) {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    }),
  );

  return !!match;
}
