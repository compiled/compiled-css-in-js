import type { API, FileInfo, ImportDeclaration, JSXAttribute, Options, Program } from 'jscodeshift';

// We want to ensure the config contract is correct so devs can get type safety
type ValidateConfig<T, Struct> = T extends Struct
  ? Exclude<keyof T, keyof Struct> extends never
    ? T
    : never
  : never;

export type BuildImportContext<T> = ValidateConfig<
  T,
  {
    // The original import node in the source code
    originalNode: ImportDeclaration;
    // The existing import node that will be replaced
    currentNode: ImportDeclaration;
    // The import name
    defaultSpecifierName: string;
    // The export from Compiled to be imported
    namedImport: string;
    // The import path for Compiled
    compiledImportPath: string;
  }
>;

export type BuildRefAttributesContext<T> = ValidateConfig<
  T,
  {
    // The original attribute node in the source code
    originalNode: JSXAttribute;
    // The existing attribute node that will be replaced
    currentNode: JSXAttribute;
  }
>;

/**
 * Interface for codemods that handle migration from CSS-in-JS libraries to Compiled
 */
export interface Transform {
  /**
   * Build the compiled import replacing the existing import
   *
   * @param context {BuildImportContext} The context applied to the build import
   * @returns {ImportDeclaration} The import to replace config.currentNode
   */
  buildImport?<T>(context: BuildImportContext<T>): ImportDeclaration;

  /**
   * Build the compiled ref attribute replacing innerRef attributes
   *
   * @param context {BuildRefAttributesContext} The context applied to the build ref attribute
   * @returns {JSXAttribute} The attribute to replace config.currentNode
   */
  buildRefAttribute?<T>(context: BuildRefAttributesContext<T>): JSXAttribute;
}

export type ProgramVisitorContext<T> = ValidateConfig<
  T,
  {
    // The initial state of the program (before any processing)
    originalProgram: Program;
    // The current state of the program
    program: Program;
  }
>;

/**
 * Visitor interface for interacting with the AST
 */
export interface Visitor {
  program?<T>(context: ProgramVisitorContext<T>): void;
}

export interface CodemodPluginInstance {
  transform?: Transform;
  visitor?: Visitor;
}

export interface CodemodPlugin {
  name: string;
  create(file: FileInfo, api: API, options: Options): CodemodPluginInstance;
}
