"""
VHF Ontology Loader (CC-102)
Load JSON-LD ontologies and extract entities, relationships, and metadata.

Supports:
- Standard JSON-LD ontologies with classes/relationships
- UniRegistry v3.0 format entries
- OAA-generated ontologies
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field


@dataclass
class Entity:
    """Represents an ontology entity/class."""
    id: str
    label: str
    description: str = ""
    entity_type: str = "Class"
    properties: Dict[str, Any] = field(default_factory=dict)
    parent_class: Optional[str] = None


@dataclass
class Relationship:
    """Represents a relationship between entities."""
    id: str
    label: str
    source: str
    target: str
    cardinality: str = "1:*"
    description: str = ""


@dataclass
class Ontology:
    """Complete ontology structure."""
    id: str
    name: str
    version: str
    description: str
    context: Dict[str, str]
    entities: List[Entity]
    relationships: List[Relationship]
    business_rules: List[Dict[str, str]] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class OntologyLoader:
    """Load and parse JSON-LD ontology files."""

    def __init__(self, base_path: Optional[Path] = None):
        """Initialize loader with optional base path for ontology files."""
        self.base_path = base_path or Path.cwd()

    def load_file(self, file_path: str | Path) -> Ontology:
        """Load ontology from JSON file."""
        path = Path(file_path)
        if not path.is_absolute():
            path = self.base_path / path

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return self.parse_ontology(data, str(path))

    def parse_ontology(self, data: Dict[str, Any], source: str = "") -> Ontology:
        """Parse ontology from JSON dict."""
        # Detect format and delegate to appropriate parser
        if "registryEntry" in data:
            return self._parse_registry_format(data, source)
        elif "ontologyDefinition" in data:
            return self._parse_uniregistry_format(data, source)
        elif "classes" in data:
            return self._parse_standard_format(data, source)
        elif "@graph" in data:
            return self._parse_graph_format(data, source)
        else:
            # Try to infer structure
            return self._parse_inferred_format(data, source)

    def _parse_standard_format(self, data: Dict, source: str) -> Ontology:
        """Parse standard JSON-LD ontology with classes key."""
        context = data.get("@context", {})
        if isinstance(context, str):
            context = {"@vocab": context}

        entities = []
        classes = data.get("classes", {})
        for class_id, class_def in classes.items():
            entity = Entity(
                id=class_def.get("@id", class_id),
                label=class_def.get("rdfs:label", class_id),
                description=class_def.get("rdfs:comment", ""),
                entity_type=class_def.get("w4m:entityType", "Class"),
                properties=class_def.get("properties", {}),
                parent_class=class_def.get("rdfs:subClassOf")
            )
            entities.append(entity)

        relationships = []
        rels = data.get("relationships", data.get("objectProperties", {}))
        if isinstance(rels, dict):
            for rel_id, rel_def in rels.items():
                if isinstance(rel_def, dict):
                    rel = Relationship(
                        id=rel_def.get("@id", rel_id),
                        label=rel_def.get("rdfs:label", rel_id),
                        source=rel_def.get("rdfs:domain", ""),
                        target=rel_def.get("rdfs:range", ""),
                        cardinality=rel_def.get("w4m:cardinality", "1:*"),
                        description=rel_def.get("rdfs:comment", "")
                    )
                    relationships.append(rel)

        business_rules = []
        rules = data.get("businessRules", data.get("w4m:cardinalRules", {}))
        if isinstance(rules, dict):
            for rule_id, rule_text in rules.items():
                business_rules.append({"id": rule_id, "rule": rule_text})
        elif isinstance(rules, list):
            business_rules = rules

        return Ontology(
            id=data.get("@id", source),
            name=data.get("name", Path(source).stem),
            version=data.get("version", "1.0.0"),
            description=data.get("description", ""),
            context=context,
            entities=entities,
            relationships=relationships,
            business_rules=business_rules,
            metadata={
                "source": source,
                "dateCreated": data.get("dateCreated"),
                "dateModified": data.get("dateModified"),
                "creator": data.get("creator")
            }
        )

    def _parse_registry_format(self, data: Dict, source: str) -> Ontology:
        """Parse registry entry format."""
        entry = data.get("registryEntry", {})

        # Extract entity list from summary
        entity_info = entry.get("entities", {})
        entity_list = entity_info.get("list", [])
        entities = [
            Entity(id=e, label=e, description="", entity_type="Class")
            for e in entity_list
        ]

        # Extract relationship list from summary
        rel_info = entry.get("relationships", {})
        rel_list = rel_info.get("list", [])
        relationships = [
            Relationship(id=r, label=r, source="", target="")
            for r in rel_list
        ]

        return Ontology(
            id=data.get("@id", entry.get("ontologyId", source)),
            name=entry.get("domain", Path(source).stem),
            version=entry.get("version", "1.0.0"),
            description=f"Domain: {entry.get('domain', '')}",
            context=data.get("@context", {}),
            entities=entities,
            relationships=relationships,
            metadata={
                "source": source,
                "status": entry.get("status"),
                "registrationDate": entry.get("registrationDate"),
                "subDomains": entry.get("subDomains", []),
                "useCases": entry.get("useCases", []),
                "consumers": entry.get("consumers", [])
            }
        )

    def _parse_uniregistry_format(self, data: Dict, source: str) -> Ontology:
        """Parse UniRegistry v1.0 format with ontologyDefinition."""
        ont_def = data.get("ontologyDefinition", {})
        metadata = data.get("registryMetadata", {})

        # Parse from @graph if present
        if "@graph" in ont_def:
            return self._parse_graph_format(ont_def, source)

        return self._parse_standard_format(ont_def, source)

    def _parse_graph_format(self, data: Dict, source: str) -> Ontology:
        """Parse JSON-LD with @graph array."""
        context = data.get("@context", {})
        graph = data.get("@graph", [])

        entities = []
        relationships = []

        for node in graph:
            node_type = node.get("@type", "")
            if "Class" in str(node_type) or node_type in ["owl:Class", "rdfs:Class"]:
                entities.append(Entity(
                    id=node.get("@id", ""),
                    label=node.get("rdfs:label", node.get("name", "")),
                    description=node.get("rdfs:comment", node.get("description", "")),
                    entity_type="Class"
                ))
            elif "Property" in str(node_type) or "ObjectProperty" in str(node_type):
                relationships.append(Relationship(
                    id=node.get("@id", ""),
                    label=node.get("rdfs:label", ""),
                    source=node.get("rdfs:domain", ""),
                    target=node.get("rdfs:range", "")
                ))

        return Ontology(
            id=data.get("@id", source),
            name=data.get("name", Path(source).stem),
            version=data.get("version", "1.0.0"),
            description=data.get("description", ""),
            context=context if isinstance(context, dict) else {"@vocab": context},
            entities=entities,
            relationships=relationships,
            metadata={"source": source}
        )

    def _parse_inferred_format(self, data: Dict, source: str) -> Ontology:
        """Attempt to parse unknown format by inferring structure."""
        entities = []
        relationships = []

        # Look for common entity containers
        for key in ["entities", "types", "concepts", "terms"]:
            if key in data:
                items = data[key]
                if isinstance(items, dict):
                    for item_id, item_def in items.items():
                        entities.append(Entity(
                            id=item_id,
                            label=item_def.get("label", item_id) if isinstance(item_def, dict) else item_id,
                            description=item_def.get("description", "") if isinstance(item_def, dict) else ""
                        ))
                elif isinstance(items, list):
                    for item in items:
                        if isinstance(item, str):
                            entities.append(Entity(id=item, label=item))
                        elif isinstance(item, dict):
                            entities.append(Entity(
                                id=item.get("@id", item.get("id", "")),
                                label=item.get("label", item.get("name", "")),
                                description=item.get("description", "")
                            ))

        return Ontology(
            id=data.get("@id", source),
            name=data.get("name", Path(source).stem),
            version=data.get("version", "1.0.0"),
            description=data.get("description", ""),
            context=data.get("@context", {}),
            entities=entities,
            relationships=relationships,
            metadata={"source": source, "format": "inferred"}
        )

    def to_dict(self, ontology: Ontology) -> Dict[str, Any]:
        """Convert Ontology dataclass to dict for serialization."""
        return {
            "id": ontology.id,
            "name": ontology.name,
            "version": ontology.version,
            "description": ontology.description,
            "context": ontology.context,
            "entities": [
                {
                    "id": e.id,
                    "label": e.label,
                    "description": e.description,
                    "type": e.entity_type,
                    "properties": e.properties,
                    "parent": e.parent_class
                }
                for e in ontology.entities
            ],
            "relationships": [
                {
                    "id": r.id,
                    "label": r.label,
                    "source": r.source,
                    "target": r.target,
                    "cardinality": r.cardinality,
                    "description": r.description
                }
                for r in ontology.relationships
            ],
            "business_rules": ontology.business_rules,
            "metadata": ontology.metadata
        }


def load_ontology(file_path: str | Path) -> Ontology:
    """Convenience function to load an ontology file."""
    loader = OntologyLoader()
    return loader.load_file(file_path)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ontology_loader.py <ontology_file.json>")
        sys.exit(1)

    ontology = load_ontology(sys.argv[1])
    print(f"Loaded: {ontology.name} v{ontology.version}")
    print(f"Entities: {len(ontology.entities)}")
    print(f"Relationships: {len(ontology.relationships)}")

    for entity in ontology.entities[:5]:
        print(f"  - {entity.label}: {entity.description[:50]}...")
