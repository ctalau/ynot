/**
 * Internal types for mapping structure
 */

export interface MappingNode {
  name: string;
  mappedName: string;
}

export interface PackageMappingNode extends MappingNode {
  classes: Map<string, ClassMappingNode>;
}

export interface ClassMappingNode extends MappingNode {
  methods: Map<string, MethodMappingNode>;
  fields: Map<string, FieldMappingNode>;
  innerClasses: Map<string, ClassMappingNode>;
}

export interface MethodMappingNode extends MappingNode {
  signature?: string;
}

export interface FieldMappingNode extends MappingNode {}
