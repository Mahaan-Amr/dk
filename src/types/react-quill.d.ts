declare module 'react-quill' {
  import React from 'react';
  
  // Define QuillRange type
  interface QuillRange {
    index: number;
    length: number;
  }

  // Define ToolbarOptions type for the toolbar configuration
  type ToolbarOptions = Array<string[] | { [key: string]: (string | number | boolean)[] }>;

  // Define the Quill editor interface
  interface QuillEditor {
    getLength(): number;
    getText(index?: number, length?: number): string;
    getHTML(): string;
    getBounds(index: number, length?: number): { 
      left: number; 
      right: number; 
      top: number; 
      bottom: number; 
      height: number; 
      width: number; 
    };
    getSelection(focus?: boolean): QuillRange | null;
    getContents(index?: number, length?: number): Delta;
  }

  // Define a basic Delta type for Quill operations
  interface DeltaOperation {
    insert?: string | object;
    delete?: number;
    retain?: number;
    attributes?: object;
  }

  interface Delta {
    ops: DeltaOperation[];
    length(): number;
    compose(other: Delta): Delta;
    transform(other: Delta, priority?: boolean): Delta;
  }

  export interface ReactQuillProps {
    id?: string;
    className?: string;
    theme?: string;
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    readOnly?: boolean;
    modules?: {
      toolbar?: ToolbarOptions | string | boolean;
      [key: string]: unknown;
    };
    formats?: string[];
    style?: React.CSSProperties;
    onChange?: (content: string) => void;
    onChangeSelection?: (range: QuillRange | null, source: string, editor: QuillEditor) => void;
    onFocus?: (range: QuillRange | null, source: string, editor: QuillEditor) => void;
    onBlur?: (previousRange: QuillRange | null, source: string, editor: QuillEditor) => void;
    onKeyPress?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    onKeyUp?: React.KeyboardEventHandler<HTMLDivElement>;
    tabIndex?: number;
    bounds?: string | HTMLElement;
    [key: string]: unknown;
  }
  
  declare class ReactQuill extends React.Component<ReactQuillProps> {
    static Quill: typeof Quill;
    editor: QuillEditor;
    focus(): void;
    blur(): void;
    getEditor(): QuillEditor;
  }

  // Basic Quill class reference
  class Quill {
    static register(path: string, def: unknown, suppressWarning?: boolean): unknown;
    static imports(path: string): unknown;
    static find(domNode: HTMLElement): Quill | null;
    static overload(path: string, def: unknown): unknown;
    static version: string;
  }
  
  export default ReactQuill;
} 