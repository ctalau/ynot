/**
 * XML mapping file parser for yGuard
 * Ported from YGuardLogParser.java MyContentHandler
 */

import type {
  TreeNode,
  PackageStruct,
  ClassStruct,
  MethodStruct,
  FieldStruct,
  Mapped,
  PropertyMap,
} from '../types/index';

/**
 * Mapping tree root
 */
export class MappingTree {
  root: TreeNode<PackageStruct>;
  properties: PropertyMap = {};

  constructor() {
    // Create root node (empty package)
    this.root = {
      data: { type: 'package', name: '', mappedName: '' },
      children: [],
    };
  }

  /**
   * Find a child node by name and type
   */
  findChild<T extends Mapped>(
    node: TreeNode,
    name: string,
    type: 'package' | 'class' | 'method' | 'field',
    useMap: boolean = false
  ): TreeNode<T> | null {
    for (const child of node.children) {
      // Type guard: check if child.data has a type property
      const childData = child.data as PackageStruct | ClassStruct | MethodStruct | FieldStruct;
      if (childData.type === type) {
        const matchName = useMap ? child.data.mappedName : child.data.name;
        if (matchName === name) {
          return child as TreeNode<T>;
        }
      }
    }
    return null;
  }

  /**
   * Get or create package node by name
   */
  getPackageNode(packageName: string | null, useMap: boolean = false): TreeNode {
    let node = this.root;
    if (packageName) {
      const tokens = packageName.split('.');
      for (const token of tokens) {
        let child = this.findChild<PackageStruct>(node, token, 'package', useMap);
        if (!child) {
          const pkg: PackageStruct = {
            type: 'package',
            name: token,
            mappedName: token,
          };
          child = {
            data: pkg,
            children: [],
            parent: node,
          };
          node.children.push(child);
        }
        node = child;
      }
    }
    return node;
  }

  /**
   * Get or create class node by fully qualified name
   */
  getClassNode(fqn: string, useMap: boolean = false): TreeNode<ClassStruct> {
    let packageName: string | null = null;
    let className: string;

    const lastDot = fqn.lastIndexOf('.');
    if (lastDot < 0) {
      className = fqn;
    } else {
      packageName = fqn.substring(0, lastDot);
      className = fqn.substring(lastDot + 1);
    }

    let node = this.getPackageNode(packageName, useMap);

    // Handle inner classes (separated by $)
    if (className.indexOf('$') > 0) {
      const tokens = className.split('$');
      for (const token of tokens) {
        let child = this.findChild<ClassStruct>(node, token, 'class', useMap);
        if (!child) {
          const cls: ClassStruct = {
            type: 'class',
            name: token,
            mappedName: token,
          };
          child = {
            data: cls,
            children: [],
            parent: node,
          };
          node.children.push(child);
        }
        node = child;
      }
      return node as TreeNode<ClassStruct>;
    } else {
      let child = this.findChild<ClassStruct>(node, className, 'class', useMap);
      if (!child) {
        const cls: ClassStruct = {
          type: 'class',
          name: className,
          mappedName: className,
        };
        child = {
          data: cls,
          children: [],
          parent: node,
        };
        node.children.push(child);
      }
      return child;
    }
  }

  /**
   * Get or create method node
   */
  getMethodNode(className: string, signature: string, useMap: boolean = false): TreeNode<MethodStruct> {
    const classNode = this.getClassNode(className, useMap);
    let child = this.findChild<MethodStruct>(classNode, signature, 'method', useMap);
    if (!child) {
      const method: MethodStruct = {
        type: 'method',
        name: signature,
        mappedName: signature,
        signature,
      };
      child = {
        data: method,
        children: [],
        parent: classNode,
      };
      classNode.children.push(child);
    }
    return child;
  }

  /**
   * Get or create field node
   */
  getFieldNode(className: string, fieldName: string, useMap: boolean = false): TreeNode<FieldStruct> {
    const classNode = this.getClassNode(className, useMap);
    let child = this.findChild<FieldStruct>(classNode, fieldName, 'field', useMap);
    if (!child) {
      const field: FieldStruct = {
        type: 'field',
        name: fieldName,
        mappedName: fieldName,
      };
      child = {
        data: field,
        children: [],
        parent: classNode,
      };
      classNode.children.push(child);
    }
    return child;
  }
}

/**
 * Parse yGuard XML mapping file
 */
export function parseMappingXml(xmlContent: string): MappingTree {
  const tree = new MappingTree();

  // Use DOMParser (works in browser and Node.js with proper polyfill)
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  // Check for parsing errors
  const parserErrors = doc.getElementsByTagName('parsererror');
  if (parserErrors.length > 0) {
    throw new Error('Invalid XML: ' + parserErrors[0].textContent);
  }

  const root = doc.documentElement;
  if (root.tagName !== 'yguard') {
    throw new Error('Not a yGuard mapping file');
  }

  // Parse version
  const version = root.getAttribute('version');
  if (version && parseFloat(version) > 1.5) {
    console.warn(`Warning: yGuard version ${version} may not be fully supported`);
  }

  // Process <map> section
  const mapElements = root.getElementsByTagName('map');
  for (let i = 0; i < mapElements.length; i++) {
    processMapSection(tree, mapElements[i]);
  }

  // Process <expose> section (exposed elements that weren't obfuscated)
  const exposeElements = root.getElementsByTagName('expose');
  for (let i = 0; i < exposeElements.length; i++) {
    processExposeSection(tree, exposeElements[i]);
  }

  return tree;
}

/**
 * Process <map> section containing obfuscation mappings
 */
function processMapSection(tree: MappingTree, mapElement: Element): void {
  // Process package mappings
  const packages = mapElement.getElementsByTagName('package');
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const name = pkg.getAttribute('name');
    const map = pkg.getAttribute('map');
    if (name && map) {
      const node = tree.getPackageNode(name);
      (node.data as PackageStruct).mappedName = map;
    }
  }

  // Process class mappings
  const classes = mapElement.getElementsByTagName('class');
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const name = cls.getAttribute('name');
    const map = cls.getAttribute('map');
    if (name && map) {
      const node = tree.getClassNode(name);
      (node.data as ClassStruct).mappedName = map;
    }
  }

  // Process method mappings
  const methods = mapElement.getElementsByTagName('method');
  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    const className = method.getAttribute('class');
    const name = method.getAttribute('name');
    const map = method.getAttribute('map');
    if (className && name && map) {
      const node = tree.getMethodNode(className, name);
      (node.data as MethodStruct).mappedName = map;
    }
  }

  // Process field mappings
  const fields = mapElement.getElementsByTagName('field');
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const className = field.getAttribute('class');
    const name = field.getAttribute('name');
    const map = field.getAttribute('map');
    if (className && name && map) {
      const node = tree.getFieldNode(className, name);
      (node.data as FieldStruct).mappedName = map;
    }
  }

  // Process properties (e.g., scrambling-salt)
  const properties = mapElement.getElementsByTagName('property');
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const owner = prop.getAttribute('owner');
    const key = prop.getAttribute('key');
    const value = prop.getAttribute('value');
    if (owner && key && value) {
      if (!tree.properties[owner]) {
        tree.properties[owner] = {};
      }
      tree.properties[owner][key] = value;
    }
  }
}

/**
 * Process <expose> section containing non-obfuscated elements
 */
function processExposeSection(tree: MappingTree, exposeElement: Element): void {
  // Process exposed packages
  const packages = exposeElement.getElementsByTagName('package');
  for (let i = 0; i < packages.length; i++) {
    const pkg = packages[i];
    const name = pkg.getAttribute('name');
    if (name) {
      tree.getPackageNode(name);
    }
  }

  // Process exposed classes
  const classes = exposeElement.getElementsByTagName('class');
  for (let i = 0; i < classes.length; i++) {
    const cls = classes[i];
    const name = cls.getAttribute('name');
    if (name) {
      tree.getClassNode(name);
    }
  }

  // Process exposed methods
  const methods = exposeElement.getElementsByTagName('method');
  for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    const className = method.getAttribute('class');
    const name = method.getAttribute('name');
    if (className && name) {
      tree.getMethodNode(className, name);
    }
  }

  // Process exposed fields
  const fields = exposeElement.getElementsByTagName('field');
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    const className = field.getAttribute('class');
    const name = field.getAttribute('name');
    if (className && name) {
      tree.getFieldNode(className, name);
    }
  }
}
