import { YGuardMapping } from '../types';
import { ClassMappingNode, PackageMappingNode } from './types';

/**
 * Parser for yGuard mapping files (XML format)
 */
export class YGuardMappingParser {
  private currentPackagePath: string[] = [];
  private currentClassPath: string[] = [];
  private packages: Map<string, PackageMappingNode> = new Map();
  private ownerProperties: Map<string, Record<string, string>> = new Map();
  private version = '1.5';
  private inMapSection = false;
  private inExposeSection = false;

  /**
   * Parse XML mapping content
   */
  parse(xmlContent: string): YGuardMapping {
    // Reset state
    this.currentPackagePath = [];
    this.currentClassPath = [];
    this.packages = new Map();
    this.ownerProperties = new Map();
    this.version = '1.5';
    this.inMapSection = false;
    this.inExposeSection = false;

    // Simple regex-based XML parsing
    const tagRegex = /<\/?(\w+)\s*([^>]*)>/g;
    let match;

    while ((match = tagRegex.exec(xmlContent)) !== null) {
      const tagName = match[1];
      const attrs = match[2];
      const isClosing = match[0].startsWith('</');

      if (isClosing) {
        this.handleCloseTag(tagName);
      } else {
        this.handleOpenTag(tagName, attrs);
      }
    }

    return {
      version: this.version,
      packages: this.packages,
      ownerProperties: this.ownerProperties,
    };
  }

  private handleOpenTag(tagName: string, attrs: string): void {
    const attributes = this.parseAttributes(attrs);

    if (tagName === 'yguard') {
      if (attributes.version) {
        this.version = attributes.version;
      }
    } else if (tagName === 'map') {
      this.inMapSection = true;
    } else if (tagName === 'expose') {
      this.inExposeSection = true;
    } else if (tagName === 'property' && !this.inMapSection) {
      const owner = attributes.owner;
      const name = attributes.name;
      const value = attributes.value;

      if (owner && name && value !== undefined) {
        if (!this.ownerProperties.has(owner)) {
          this.ownerProperties.set(owner, {});
        }
        const props = this.ownerProperties.get(owner)!;
        props[name] = value;
      }
    } else if (tagName === 'package' && this.inMapSection) {
      const name = attributes.name;
      const map = attributes.map;
      if (name && map) {
        this.addPackage(name, map);
      }
    } else if (tagName === 'class') {
      const name = attributes.name;
      const map = attributes.map;
      if (name && map) {
        if (this.inMapSection) {
          this.addClass(name, map);
        }
      }
    } else if (tagName === 'method' && (this.inMapSection || this.inExposeSection)) {
      const className = attributes.class;
      const name = attributes.name;
      const map = attributes.map;
      if (className && name) {
        if (this.inMapSection && map) {
          this.addMethod(className, name, map);
        }
      }
    } else if (tagName === 'field' && (this.inMapSection || this.inExposeSection)) {
      const className = attributes.class;
      const name = attributes.name;
      const map = attributes.map;
      if (className && name) {
        if (this.inMapSection && map) {
          this.addField(className, name, map);
        }
      }
    }
  }

  private handleCloseTag(tagName: string): void {
    if (tagName === 'map') {
      this.inMapSection = false;
      this.currentPackagePath = [];
      this.currentClassPath = [];
    } else if (tagName === 'expose') {
      this.inExposeSection = false;
    } else if (tagName === 'package') {
      if (this.currentPackagePath.length > 0) {
        this.currentPackagePath.pop();
      }
    } else if (tagName === 'class') {
      if (this.currentClassPath.length > 0) {
        this.currentClassPath.pop();
      }
    }
  }

  private parseAttributes(attrString: string): Record<string, string> {
    const attributes: Record<string, string> = {};
    const attrRegex = /(\w+)="([^"]*)"/g;
    let match;

    while ((match = attrRegex.exec(attrString)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  private addPackage(name: string, mapName: string): void {
    // Add or update package mapping
    if (!this.packages.has(name)) {
      this.packages.set(name, {
        name,
        mappedName: mapName,
        classes: new Map(),
      });
    } else {
      const pkg = this.packages.get(name)!;
      pkg.mappedName = mapName;
    }
  }

  private addClass(fqn: string, mapName: string): void {
    // Get or create package
    let pkg = this.packages.get(fqn);
    if (!pkg) {
      pkg = {
        name: fqn,
        mappedName: mapName,
        classes: new Map(),
      };
      this.packages.set(fqn, pkg);
    } else {
      pkg.mappedName = mapName;
    }
  }

  private addMethod(className: string, methodName: string, mappedName: string): void {
    const classNode = this.getOrCreateClass(className);
    classNode.methods.set(methodName, {
      name: methodName,
      mappedName,
      signature: this.extractSignature(methodName),
    });
  }

  private addField(className: string, fieldName: string, mappedName: string): void {
    const classNode = this.getOrCreateClass(className);
    classNode.fields.set(fieldName, {
      name: fieldName,
      mappedName,
    });
  }

  private getOrCreateClass(fqn: string): ClassMappingNode {
    // Parse FQN for package and inner classes
    let classNode: ClassMappingNode;

    if (!this.packages.has(fqn)) {
      classNode = {
        name: fqn,
        mappedName: fqn, // Default to original if not remapped
        methods: new Map(),
        fields: new Map(),
        innerClasses: new Map(),
      };
      this.packages.set(fqn, classNode as any);
    } else {
      classNode = this.packages.get(fqn) as any;
    }

    return classNode;
  }

  private extractSignature(methodName: string): string | undefined {
    const parenIndex = methodName.indexOf('(');
    if (parenIndex >= 0) {
      return methodName.substring(parenIndex);
    }
    return undefined;
  }
}
