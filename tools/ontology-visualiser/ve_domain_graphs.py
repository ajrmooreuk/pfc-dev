"""
VHF VE Domain Graphs (CC-106)
Value Engineering specific graph templates and analysis.

Features:
- W4M 8-layer business framework
- Value chain path analysis
- Agent context integration
- Cross-domain relationship mapping
- VE metric tracking
"""

import networkx as nx
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path
from dataclasses import dataclass, field

from ontology_loader import OntologyLoader, Ontology
from graph_builder import OntologyGraphBuilder, get_graph_stats


@dataclass
class W4MLayer:
    """Represents a W4M business framework layer."""
    index: int
    name: str
    description: str
    key_entities: List[str] = field(default_factory=list)
    ontology_id: Optional[str] = None


class W4MFramework:
    """W4M 8-Layer Business Framework."""

    LAYERS = [
        W4MLayer(0, "Problem Space", "Customer pain points and market gaps"),
        W4MLayer(1, "ICP", "Ideal Customer Profile definition"),
        W4MLayer(2, "Solution", "Product/service offering"),
        W4MLayer(3, "Value Proposition", "Unique value delivery"),
        W4MLayer(4, "Business Model", "Revenue and cost structure"),
        W4MLayer(5, "Competitive Analysis", "Market positioning vs competitors"),
        W4MLayer(6, "Market Positioning", "Brand and market strategy"),
        W4MLayer(7, "Strategy", "VSOM - Vision, Strategy, Objectives, Metrics"),
    ]

    # Layer colors (gradient from dark to light blue)
    LAYER_COLORS = [
        '#1A237E', '#283593', '#303F9F', '#3949AB',
        '#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA'
    ]

    def __init__(self):
        """Initialize W4M framework."""
        self.layers = {layer.name: layer for layer in self.LAYERS}

    def get_layer(self, name: str) -> Optional[W4MLayer]:
        """Get layer by name (case-insensitive partial match)."""
        name_lower = name.lower()
        for layer in self.LAYERS:
            if layer.name.lower() in name_lower or name_lower in layer.name.lower():
                return layer
        return None

    def get_layer_by_index(self, index: int) -> Optional[W4MLayer]:
        """Get layer by index."""
        if 0 <= index < len(self.LAYERS):
            return self.LAYERS[index]
        return None


class VEDomainGraphBuilder:
    """Build VE-specific domain graphs."""

    def __init__(self):
        """Initialize VE domain graph builder."""
        self.framework = W4MFramework()
        self.loader = OntologyLoader()
        self.builder = OntologyGraphBuilder()

    def build_w4m_framework_graph(self) -> nx.DiGraph:
        """
        Build the core W4M 8-layer framework graph.

        Returns:
            NetworkX DiGraph with layer nodes and flow edges
        """
        G = nx.DiGraph()
        G.graph['name'] = 'W4M Business Framework'
        G.graph['type'] = 'framework'

        # Add layer nodes
        for layer in self.framework.LAYERS:
            G.add_node(
                f"layer_{layer.index}",
                label=layer.name,
                description=layer.description,
                node_type='ve_layer',
                layer_index=layer.index,
                color=self.framework.LAYER_COLORS[layer.index],
                size=50
            )

        # Add flow edges (each layer informs the next)
        for i in range(len(self.framework.LAYERS) - 1):
            G.add_edge(
                f"layer_{i}",
                f"layer_{i+1}",
                label='informs',
                edge_type='value_flow',
                weight=1.0,
                color='#37474F'
            )

        # Add feedback loops (strategy influences all layers)
        strategy_layer = f"layer_{len(self.framework.LAYERS) - 1}"
        for i in range(len(self.framework.LAYERS) - 1):
            G.add_edge(
                strategy_layer,
                f"layer_{i}",
                label='guides',
                edge_type='feedback',
                weight=0.5,
                color='#78909C',
                style='dashed'
            )

        return G

    def build_ve_value_chain(
        self,
        layer_ontologies: Dict[str, Ontology]
    ) -> nx.DiGraph:
        """
        Build a VE value chain connecting ontologies to W4M layers.

        Args:
            layer_ontologies: Dict mapping layer names to Ontology objects

        Returns:
            Combined value chain graph
        """
        # Start with framework graph
        G = self.build_w4m_framework_graph()

        # Add ontology entities to relevant layers
        for layer_name, ontology in layer_ontologies.items():
            layer = self.framework.get_layer(layer_name)
            if not layer:
                continue

            layer_node = f"layer_{layer.index}"

            # Build ontology subgraph
            ont_graph = self.builder.build_graph(ontology)

            # Add ontology nodes with layer prefix
            for node, data in ont_graph.nodes(data=True):
                prefixed_node = f"{layer_name}_{node}"
                G.add_node(prefixed_node, **data)
                G.add_edge(
                    layer_node,
                    prefixed_node,
                    label='contains',
                    edge_type='layer_content',
                    color='#90A4AE'
                )

            # Add ontology edges with prefixed nodes
            for u, v, data in ont_graph.edges(data=True):
                G.add_edge(f"{layer_name}_{u}", f"{layer_name}_{v}", **data)

        return G

    def build_vsom_graph(self, vsom_ontology: Ontology) -> nx.DiGraph:
        """
        Build VSOM (Vision-Strategy-Objectives-Metrics) specific graph.

        Args:
            vsom_ontology: VSOM ontology object

        Returns:
            VSOM hierarchical graph
        """
        G = nx.DiGraph()
        G.graph['name'] = 'VSOM Framework'
        G.graph['type'] = 'vsom'

        # VSOM hierarchy nodes
        vsom_levels = [
            ('vision', 'Vision', 'Long-term aspirational state', '#1565C0'),
            ('strategy', 'Strategy', 'Approach to achieve vision', '#1976D2'),
            ('objectives', 'Objectives', 'Measurable goals', '#1E88E5'),
            ('metrics', 'Metrics', 'KPIs and measurements', '#2196F3'),
        ]

        # Add VSOM hierarchy
        for i, (node_id, label, desc, color) in enumerate(vsom_levels):
            G.add_node(
                node_id,
                label=label,
                description=desc,
                node_type='vsom_level',
                level=i,
                color=color,
                size=45 - (i * 5)
            )

            if i > 0:
                prev_id = vsom_levels[i-1][0]
                G.add_edge(
                    prev_id,
                    node_id,
                    label='cascades_to',
                    edge_type='vsom_cascade'
                )

        # Add ontology entities
        ont_graph = self.builder.build_graph(vsom_ontology)

        # Map entities to VSOM levels
        for node, data in ont_graph.nodes(data=True):
            level = self._infer_vsom_level(node, data)
            if level:
                G.add_node(node, **data)
                G.add_edge(
                    level,
                    node,
                    label='includes',
                    edge_type='vsom_content'
                )

        # Add ontology relationships
        for u, v, data in ont_graph.edges(data=True):
            if u in G and v in G:
                G.add_edge(u, v, **data)

        return G

    def _infer_vsom_level(self, node: str, data: Dict) -> Optional[str]:
        """Infer which VSOM level a node belongs to."""
        node_lower = str(node).lower()
        label_lower = data.get('label', '').lower()

        if any(x in node_lower or x in label_lower for x in ['vision', 'mission', 'purpose']):
            return 'vision'
        elif any(x in node_lower or x in label_lower for x in ['strategy', 'plan', 'approach']):
            return 'strategy'
        elif any(x in node_lower or x in label_lower for x in ['objective', 'goal', 'target', 'okr']):
            return 'objectives'
        elif any(x in node_lower or x in label_lower for x in ['metric', 'kpi', 'measure', 'indicator']):
            return 'metrics'

        return None

    def analyze_value_flow(
        self,
        G: nx.DiGraph,
        source_layer: int = 0,
        target_layer: int = 7
    ) -> Dict[str, Any]:
        """
        Analyze value flow through the W4M layers.

        Args:
            G: Value chain graph
            source_layer: Starting layer index
            target_layer: Ending layer index

        Returns:
            Analysis results including paths and metrics
        """
        source = f"layer_{source_layer}"
        target = f"layer_{target_layer}"

        analysis = {
            'source': self.framework.LAYERS[source_layer].name,
            'target': self.framework.LAYERS[target_layer].name,
            'paths': [],
            'bottlenecks': [],
            'metrics': {}
        }

        # Find all paths
        try:
            all_paths = list(nx.all_simple_paths(G, source, target, cutoff=10))
            analysis['paths'] = [
                [G.nodes[n].get('label', n) for n in path]
                for path in all_paths[:5]
            ]
        except nx.NetworkXNoPath:
            pass

        # Identify bottlenecks (nodes with high betweenness)
        if G.number_of_nodes() > 2:
            betweenness = nx.betweenness_centrality(G)
            top_bottlenecks = sorted(betweenness.items(), key=lambda x: x[1], reverse=True)[:5]
            analysis['bottlenecks'] = [
                {'node': G.nodes[n].get('label', n), 'score': score}
                for n, score in top_bottlenecks
                if score > 0
            ]

        # Calculate flow metrics
        layer_nodes = [n for n in G.nodes() if n.startswith('layer_')]
        analysis['metrics'] = {
            'total_nodes': G.number_of_nodes(),
            'total_edges': G.number_of_edges(),
            'layer_count': len(layer_nodes),
            'avg_layer_connections': G.number_of_edges() / max(len(layer_nodes), 1)
        }

        return analysis


class AgentVEIntegration:
    """Integrate agent context with VE domain graphs."""

    def __init__(self):
        """Initialize agent VE integration."""
        self.ve_builder = VEDomainGraphBuilder()

    def build_agent_ve_context(
        self,
        agent_spec: Dict[str, Any],
        ve_graph: nx.DiGraph
    ) -> nx.DiGraph:
        """
        Build graph showing agent's relationship to VE layers.

        Args:
            agent_spec: Agent specification with W4M alignment
            ve_graph: VE domain graph

        Returns:
            Combined agent-VE graph
        """
        G = ve_graph.copy()

        # Extract agent info
        agent_id = agent_spec.get('agentId', 'agent')
        agent_name = agent_spec.get('agentName', agent_id)
        w4m_alignment = agent_spec.get('w4mAlignment', {})

        # Add agent node
        G.add_node(
            agent_id,
            label=agent_name,
            node_type='agent',
            color='#E91E63',
            size=55
        )

        # Connect agent to relevant W4M layers
        primary_layers = w4m_alignment.get('primaryLayers', [])
        for layer_name in primary_layers:
            layer = self.ve_builder.framework.get_layer(layer_name)
            if layer:
                layer_node = f"layer_{layer.index}"
                G.add_edge(
                    agent_id,
                    layer_node,
                    label='operates_in',
                    edge_type='agent_layer',
                    weight=1.0,
                    color='#E91E63'
                )

        # Add ontology bindings if present
        bindings = agent_spec.get('ontologyBindings', {})
        for binding_type in ['CONSUMES', 'PRODUCES', 'REQUIRES']:
            for ont_ref in bindings.get(binding_type, []):
                ont_id = ont_ref if isinstance(ont_ref, str) else ont_ref.get('ontologyId', '')
                if ont_id:
                    # Check if ontology node exists in graph
                    matching_nodes = [n for n in G.nodes() if ont_id in str(n)]
                    for node in matching_nodes:
                        edge_dir = (agent_id, node) if binding_type == 'PRODUCES' else (node, agent_id)
                        G.add_edge(
                            edge_dir[0],
                            edge_dir[1],
                            label=binding_type.lower(),
                            edge_type='ontology_binding',
                            color='#9C27B0'
                        )

        return G


def build_ve_framework() -> nx.DiGraph:
    """Convenience function to build W4M framework graph."""
    builder = VEDomainGraphBuilder()
    return builder.build_w4m_framework_graph()


def analyze_ve_graph(G: nx.DiGraph) -> Dict[str, Any]:
    """Convenience function to analyze a VE graph."""
    builder = VEDomainGraphBuilder()
    return builder.analyze_value_flow(G)


if __name__ == "__main__":
    # Demo: Build and display W4M framework
    builder = VEDomainGraphBuilder()
    G = builder.build_w4m_framework_graph()

    print("W4M Business Framework Graph")
    print("=" * 40)

    stats = get_graph_stats(G)
    print(f"Nodes: {stats['nodes']}")
    print(f"Edges: {stats['edges']}")

    print("\nLayers:")
    for layer in builder.framework.LAYERS:
        print(f"  {layer.index}. {layer.name}: {layer.description}")

    # Analyze value flow
    analysis = builder.analyze_value_flow(G)
    print(f"\nValue Flow Analysis:")
    print(f"  From: {analysis['source']}")
    print(f"  To: {analysis['target']}")
    print(f"  Paths: {len(analysis['paths'])}")
