"""
VHF NetworkX Graph Builder (CC-103)
Convert ontologies to NetworkX graphs for visualization and analysis.

Features:
- Entity nodes with attributes
- Relationship edges with cardinality
- Business rules as edge metadata
- Agent context integration
- VE value chain paths
"""

import networkx as nx
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

from ontology_loader import Ontology, Entity, Relationship, OntologyLoader


class OntologyGraphBuilder:
    """Build NetworkX graphs from ontology structures."""

    def __init__(self):
        """Initialize the graph builder."""
        self.loader = OntologyLoader()

    def build_graph(self, ontology: Ontology) -> nx.DiGraph:
        """
        Build a directed graph from an ontology.

        Args:
            ontology: Parsed Ontology object

        Returns:
            NetworkX DiGraph with entities as nodes and relationships as edges
        """
        G = nx.DiGraph()

        # Add metadata to graph
        G.graph['name'] = ontology.name
        G.graph['version'] = ontology.version
        G.graph['description'] = ontology.description
        G.graph['ontology_id'] = ontology.id

        # Add entity nodes
        self._add_entity_nodes(G, ontology.entities)

        # Add relationship edges
        self._add_relationship_edges(G, ontology.relationships)

        # Add inheritance edges (parent class relationships)
        self._add_inheritance_edges(G, ontology.entities)

        # Add business rules as graph attributes
        G.graph['business_rules'] = ontology.business_rules

        return G

    def _add_entity_nodes(self, G: nx.DiGraph, entities: List[Entity]) -> None:
        """Add entity nodes with attributes."""
        for entity in entities:
            G.add_node(
                entity.id,
                label=entity.label,
                description=entity.description,
                entity_type=entity.entity_type,
                properties=entity.properties,
                node_type='entity',
                color=self._get_entity_color(entity.entity_type)
            )

    def _add_relationship_edges(self, G: nx.DiGraph, relationships: List[Relationship]) -> None:
        """Add relationship edges with attributes."""
        for rel in relationships:
            if rel.source and rel.target:
                # Ensure source and target nodes exist
                if rel.source not in G:
                    G.add_node(rel.source, label=rel.source, node_type='entity')
                if rel.target not in G:
                    G.add_node(rel.target, label=rel.target, node_type='entity')

                G.add_edge(
                    rel.source,
                    rel.target,
                    id=rel.id,
                    label=rel.label,
                    cardinality=rel.cardinality,
                    description=rel.description,
                    edge_type='relationship',
                    color='#666666'
                )

    def _add_inheritance_edges(self, G: nx.DiGraph, entities: List[Entity]) -> None:
        """Add inheritance edges for class hierarchy."""
        for entity in entities:
            if entity.parent_class:
                parent_id = entity.parent_class
                if parent_id not in G:
                    G.add_node(parent_id, label=parent_id, node_type='external')

                G.add_edge(
                    entity.id,
                    parent_id,
                    label='subClassOf',
                    edge_type='inheritance',
                    color='#999999',
                    style='dashed'
                )

    def _get_entity_color(self, entity_type: str) -> str:
        """Get color based on entity type."""
        colors = {
            'Core': '#4CAF50',      # Green
            'Framework': '#2196F3',  # Blue
            'Supporting': '#FF9800', # Orange
            'External': '#9E9E9E',   # Grey
            'Class': '#673AB7',      # Purple
            'Agent': '#E91E63',      # Pink
        }
        return colors.get(entity_type, '#607D8B')  # Default blue-grey

    def from_file(self, file_path: str | Path) -> nx.DiGraph:
        """Load ontology from file and build graph."""
        ontology = self.loader.load_file(file_path)
        return self.build_graph(ontology)

    def from_json(self, data: Dict[str, Any]) -> nx.DiGraph:
        """Build graph from JSON dict."""
        ontology = self.loader.parse_ontology(data)
        return self.build_graph(ontology)


class AgentContextGraphBuilder:
    """Build graphs showing agent-ontology relationships."""

    def __init__(self):
        """Initialize the agent context builder."""
        self.base_builder = OntologyGraphBuilder()

    def build_agent_context_graph(
        self,
        agent_bindings: Dict[str, Any],
        ontology_graphs: Dict[str, nx.DiGraph]
    ) -> nx.DiGraph:
        """
        Build a graph showing agent relationships to ontologies.

        Args:
            agent_bindings: Agent specification with CONSUMES/PRODUCES/REQUIRES
            ontology_graphs: Dict mapping ontology IDs to their graphs

        Returns:
            Combined graph with agent context
        """
        G = nx.DiGraph()

        # Add agent node
        agent_id = agent_bindings.get('agentId', 'agent')
        agent_name = agent_bindings.get('agentName', agent_id)

        G.add_node(
            agent_id,
            label=agent_name,
            node_type='agent',
            color='#E91E63'
        )

        # Process ontology bindings
        bindings = agent_bindings.get('ontologyBindings', {})

        for binding_type in ['CONSUMES', 'PRODUCES', 'REQUIRES']:
            ontologies = bindings.get(binding_type, [])
            for ont_ref in ontologies:
                ont_id = ont_ref if isinstance(ont_ref, str) else ont_ref.get('ontologyId', '')

                # Add ontology node
                if ont_id not in G:
                    G.add_node(
                        ont_id,
                        label=ont_id,
                        node_type='ontology',
                        color='#2196F3'
                    )

                # Add binding edge
                if binding_type == 'PRODUCES':
                    G.add_edge(agent_id, ont_id, label=binding_type, edge_type='binding')
                else:
                    G.add_edge(ont_id, agent_id, label=binding_type, edge_type='binding')

                # Merge ontology graph if available
                if ont_id in ontology_graphs:
                    ont_graph = ontology_graphs[ont_id]
                    G = nx.compose(G, ont_graph)

        return G


class VEValueChainBuilder:
    """Build graphs representing VE (Value Engineering) value chains."""

    W4M_LAYERS = [
        'Problem Space',
        'ICP',
        'Solution',
        'Value Proposition',
        'Business Model',
        'Competitive Analysis',
        'Market Positioning',
        'Strategy'
    ]

    def build_value_chain_graph(
        self,
        layer_ontologies: Dict[str, nx.DiGraph]
    ) -> nx.DiGraph:
        """
        Build a VE value chain graph connecting 8 business layers.

        Args:
            layer_ontologies: Dict mapping layer names to their ontology graphs

        Returns:
            Connected value chain graph
        """
        G = nx.DiGraph()

        # Add layer nodes
        for i, layer in enumerate(self.W4M_LAYERS):
            G.add_node(
                f"layer_{i}",
                label=layer,
                node_type='ve_layer',
                layer_index=i,
                color=self._get_layer_color(i)
            )

            # Connect to next layer
            if i > 0:
                G.add_edge(
                    f"layer_{i-1}",
                    f"layer_{i}",
                    label='informs',
                    edge_type='value_chain',
                    weight=1.0
                )

        # Merge ontology graphs into relevant layers
        for layer_name, ont_graph in layer_ontologies.items():
            layer_idx = self._find_layer_index(layer_name)
            if layer_idx is not None:
                # Connect ontology entities to layer
                for node in ont_graph.nodes():
                    G.add_node(node, **ont_graph.nodes[node])
                    G.add_edge(
                        f"layer_{layer_idx}",
                        node,
                        label='contains',
                        edge_type='layer_content'
                    )

                # Add ontology edges
                for u, v, data in ont_graph.edges(data=True):
                    G.add_edge(u, v, **data)

        return G

    def _find_layer_index(self, layer_name: str) -> Optional[int]:
        """Find layer index by name (case insensitive partial match)."""
        layer_lower = layer_name.lower()
        for i, layer in enumerate(self.W4M_LAYERS):
            if layer.lower() in layer_lower or layer_lower in layer.lower():
                return i
        return None

    def _get_layer_color(self, index: int) -> str:
        """Get color gradient for layer."""
        colors = [
            '#1A237E',  # Deep blue
            '#283593',
            '#303F9F',
            '#3949AB',
            '#3F51B5',
            '#5C6BC0',
            '#7986CB',
            '#9FA8DA',  # Light blue
        ]
        return colors[index % len(colors)]


def build_ontology_graph(file_path: str | Path) -> nx.DiGraph:
    """Convenience function to build graph from file."""
    builder = OntologyGraphBuilder()
    return builder.from_file(file_path)


def get_graph_stats(G: nx.DiGraph) -> Dict[str, Any]:
    """Get statistics about a graph."""
    return {
        'nodes': G.number_of_nodes(),
        'edges': G.number_of_edges(),
        'density': nx.density(G),
        'is_dag': nx.is_directed_acyclic_graph(G),
        'components': nx.number_weakly_connected_components(G),
        'node_types': _count_node_types(G),
        'edge_types': _count_edge_types(G)
    }


def _count_node_types(G: nx.DiGraph) -> Dict[str, int]:
    """Count nodes by type."""
    types = {}
    for node, data in G.nodes(data=True):
        node_type = data.get('node_type', 'unknown')
        types[node_type] = types.get(node_type, 0) + 1
    return types


def _count_edge_types(G: nx.DiGraph) -> Dict[str, int]:
    """Count edges by type."""
    types = {}
    for u, v, data in G.edges(data=True):
        edge_type = data.get('edge_type', 'unknown')
        types[edge_type] = types.get(edge_type, 0) + 1
    return types


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python graph_builder.py <ontology_file.json>")
        sys.exit(1)

    G = build_ontology_graph(sys.argv[1])
    stats = get_graph_stats(G)

    print(f"Graph: {G.graph.get('name', 'Unknown')}")
    print(f"Nodes: {stats['nodes']}")
    print(f"Edges: {stats['edges']}")
    print(f"Density: {stats['density']:.4f}")
    print(f"Is DAG: {stats['is_dag']}")
    print(f"Node types: {stats['node_types']}")
    print(f"Edge types: {stats['edge_types']}")
