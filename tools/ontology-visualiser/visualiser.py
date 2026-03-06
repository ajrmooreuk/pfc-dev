"""
VHF Ontology Visualiser (CC-104)
Interactive and static visualization of ontology graphs.

Features:
- PyVis interactive HTML graphs
- Matplotlib static exports
- Domain filtering
- Value chain path highlighting
- Export to PNG/SVG
"""

import networkx as nx
from typing import Dict, List, Any, Optional, Set
from pathlib import Path

try:
    from pyvis.network import Network
    PYVIS_AVAILABLE = True
except ImportError:
    PYVIS_AVAILABLE = False

try:
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False


class OntologyVisualiser:
    """Visualise ontology graphs using PyVis and Matplotlib."""

    # Default styling
    DEFAULT_NODE_SIZE = 25
    DEFAULT_EDGE_WIDTH = 2
    DEFAULT_FONT_SIZE = 12

    # Color schemes by domain
    DOMAIN_COLORS = {
        'VE': '#4CAF50',       # Green - Value Engineering
        'CE': '#2196F3',       # Blue - Context Engineering
        'Agent': '#E91E63',    # Pink - Agents
        'Core': '#9C27B0',     # Purple - Core ontologies
        'Framework': '#FF9800', # Orange - Frameworks
    }

    def __init__(self, height: str = "800px", width: str = "100%"):
        """Initialize visualiser with default dimensions."""
        self.height = height
        self.width = width

    def render_pyvis(
        self,
        G: nx.DiGraph,
        output_path: Optional[str] = None,
        physics: bool = True,
        notebook: bool = False
    ) -> Optional[str]:
        """
        Render graph as interactive HTML using PyVis.

        Args:
            G: NetworkX graph
            output_path: Path for HTML output (default: graph_name.html)
            physics: Enable physics simulation
            notebook: Render inline in Jupyter

        Returns:
            Path to generated HTML file
        """
        if not PYVIS_AVAILABLE:
            raise ImportError("PyVis not installed. Run: pip install pyvis")

        net = Network(
            height=self.height,
            width=self.width,
            directed=True,
            notebook=notebook
        )

        # Configure physics
        if physics:
            net.barnes_hut(gravity=-3000, spring_length=200)
        else:
            net.toggle_physics(False)

        # Add nodes with styling
        for node, data in G.nodes(data=True):
            label = data.get('label', str(node))
            title = self._build_node_tooltip(node, data)
            color = data.get('color', '#607D8B')
            node_type = data.get('node_type', 'entity')

            size = self._get_node_size(node_type)
            shape = self._get_node_shape(node_type)

            net.add_node(
                str(node),
                label=label,
                title=title,
                color=color,
                size=size,
                shape=shape
            )

        # Add edges with styling
        for u, v, data in G.edges(data=True):
            label = data.get('label', '')
            title = self._build_edge_tooltip(data)
            color = data.get('color', '#666666')
            width = self._get_edge_width(data.get('edge_type', 'relationship'))

            net.add_edge(
                str(u),
                str(v),
                label=label,
                title=title,
                color=color,
                width=width,
                arrows='to'
            )

        # Set output path
        if output_path is None:
            name = G.graph.get('name', 'ontology').replace(' ', '_').lower()
            output_path = f"{name}_graph.html"

        # Generate HTML
        if notebook:
            return net.show(output_path)
        else:
            net.save_graph(output_path)
            return output_path

    def render_matplotlib(
        self,
        G: nx.DiGraph,
        output_path: Optional[str] = None,
        figsize: tuple = (16, 12),
        layout: str = 'spring',
        show_labels: bool = True,
        show_edge_labels: bool = True,
        dpi: int = 150
    ) -> Optional[str]:
        """
        Render graph as static image using Matplotlib.

        Args:
            G: NetworkX graph
            output_path: Path for image output (PNG/SVG)
            figsize: Figure dimensions
            layout: Layout algorithm (spring, circular, kamada_kawai, shell)
            show_labels: Show node labels
            show_edge_labels: Show edge labels
            dpi: Image resolution

        Returns:
            Path to generated image
        """
        if not MATPLOTLIB_AVAILABLE:
            raise ImportError("Matplotlib not installed. Run: pip install matplotlib")

        fig, ax = plt.subplots(figsize=figsize)

        # Calculate layout
        pos = self._calculate_layout(G, layout)

        # Get node colors and sizes
        node_colors = [G.nodes[n].get('color', '#607D8B') for n in G.nodes()]
        node_sizes = [self._get_node_size(G.nodes[n].get('node_type', 'entity')) * 20 for n in G.nodes()]

        # Draw nodes
        nx.draw_networkx_nodes(
            G, pos,
            node_color=node_colors,
            node_size=node_sizes,
            ax=ax
        )

        # Draw edges
        edge_colors = [G.edges[e].get('color', '#666666') for e in G.edges()]
        nx.draw_networkx_edges(
            G, pos,
            edge_color=edge_colors,
            arrows=True,
            arrowsize=15,
            ax=ax
        )

        # Draw labels
        if show_labels:
            labels = {n: G.nodes[n].get('label', str(n)) for n in G.nodes()}
            nx.draw_networkx_labels(
                G, pos,
                labels=labels,
                font_size=self.DEFAULT_FONT_SIZE,
                ax=ax
            )

        if show_edge_labels:
            edge_labels = {(u, v): G.edges[u, v].get('label', '') for u, v in G.edges()}
            nx.draw_networkx_edge_labels(
                G, pos,
                edge_labels=edge_labels,
                font_size=self.DEFAULT_FONT_SIZE - 2,
                ax=ax
            )

        # Add legend
        self._add_legend(ax, G)

        # Add title
        title = G.graph.get('name', 'Ontology Graph')
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.axis('off')

        plt.tight_layout()

        # Save or show
        if output_path:
            plt.savefig(output_path, dpi=dpi, bbox_inches='tight')
            plt.close()
            return output_path
        else:
            plt.show()
            return None

    def filter_by_domain(
        self,
        G: nx.DiGraph,
        domain: str,
        include_connected: bool = True
    ) -> nx.DiGraph:
        """
        Filter graph to show only nodes from a specific domain.

        Args:
            G: Source graph
            domain: Domain to filter (VE, CE, Agent, etc.)
            include_connected: Include nodes connected to domain nodes

        Returns:
            Filtered subgraph
        """
        domain_nodes: Set[str] = set()

        # Find nodes matching domain
        for node, data in G.nodes(data=True):
            node_domain = self._infer_domain(node, data)
            if node_domain == domain:
                domain_nodes.add(node)

        # Include connected nodes if requested
        if include_connected:
            for node in list(domain_nodes):
                domain_nodes.update(G.predecessors(node))
                domain_nodes.update(G.successors(node))

        return G.subgraph(domain_nodes).copy()

    def highlight_path(
        self,
        G: nx.DiGraph,
        start: str,
        end: str,
        highlight_color: str = '#FF5722'
    ) -> nx.DiGraph:
        """
        Highlight shortest path between two nodes.

        Args:
            G: Source graph
            start: Start node ID
            end: End node ID
            highlight_color: Color for highlighted path

        Returns:
            Graph with highlighted path
        """
        H = G.copy()

        try:
            path = nx.shortest_path(G, start, end)

            # Highlight path nodes
            for node in path:
                H.nodes[node]['color'] = highlight_color
                H.nodes[node]['highlighted'] = True

            # Highlight path edges
            for i in range(len(path) - 1):
                if H.has_edge(path[i], path[i+1]):
                    H.edges[path[i], path[i+1]]['color'] = highlight_color
                    H.edges[path[i], path[i+1]]['width'] = 4

        except nx.NetworkXNoPath:
            print(f"No path found between {start} and {end}")

        return H

    def _build_node_tooltip(self, node: str, data: Dict) -> str:
        """Build HTML tooltip for node."""
        lines = [f"<b>{data.get('label', node)}</b>"]

        if desc := data.get('description'):
            lines.append(f"<br>{desc[:200]}...")

        if node_type := data.get('node_type'):
            lines.append(f"<br><i>Type: {node_type}</i>")

        if props := data.get('properties'):
            lines.append(f"<br>Properties: {len(props)}")

        return ''.join(lines)

    def _build_edge_tooltip(self, data: Dict) -> str:
        """Build HTML tooltip for edge."""
        lines = [f"<b>{data.get('label', 'relationship')}</b>"]

        if card := data.get('cardinality'):
            lines.append(f"<br>Cardinality: {card}")

        if desc := data.get('description'):
            lines.append(f"<br>{desc}")

        return ''.join(lines)

    def _get_node_size(self, node_type: str) -> int:
        """Get node size based on type."""
        sizes = {
            'agent': 40,
            'ontology': 35,
            've_layer': 45,
            'entity': 25,
            'external': 20
        }
        return sizes.get(node_type, self.DEFAULT_NODE_SIZE)

    def _get_node_shape(self, node_type: str) -> str:
        """Get node shape based on type."""
        shapes = {
            'agent': 'star',
            'ontology': 'database',
            've_layer': 'box',
            'entity': 'dot',
            'external': 'triangle'
        }
        return shapes.get(node_type, 'dot')

    def _get_edge_width(self, edge_type: str) -> int:
        """Get edge width based on type."""
        widths = {
            'relationship': 2,
            'inheritance': 1,
            'binding': 3,
            'value_chain': 4
        }
        return widths.get(edge_type, self.DEFAULT_EDGE_WIDTH)

    def _calculate_layout(self, G: nx.DiGraph, layout: str) -> Dict:
        """Calculate node positions using specified layout."""
        layouts = {
            'spring': lambda: nx.spring_layout(G, k=2, iterations=50),
            'circular': lambda: nx.circular_layout(G),
            'kamada_kawai': lambda: nx.kamada_kawai_layout(G),
            'shell': lambda: nx.shell_layout(G),
            'spectral': lambda: nx.spectral_layout(G)
        }
        return layouts.get(layout, layouts['spring'])()

    def _infer_domain(self, node: str, data: Dict) -> str:
        """Infer domain from node data."""
        node_lower = str(node).lower()
        label_lower = data.get('label', '').lower()

        if 'agent' in node_lower or data.get('node_type') == 'agent':
            return 'Agent'
        elif any(x in node_lower for x in ['vsom', 'vesm', 'value']):
            return 'VE'
        elif any(x in node_lower for x in ['context', 'org']):
            return 'CE'
        elif data.get('entity_type') == 'Framework':
            return 'Framework'
        else:
            return 'Core'

    def _add_legend(self, ax, G: nx.DiGraph) -> None:
        """Add legend to matplotlib figure."""
        # Collect unique node types
        node_types = set()
        for node, data in G.nodes(data=True):
            node_types.add((data.get('node_type', 'entity'), data.get('color', '#607D8B')))

        patches = []
        for node_type, color in sorted(node_types):
            patches.append(mpatches.Patch(color=color, label=node_type))

        if patches:
            ax.legend(handles=patches, loc='upper left', fontsize=10)


def render_interactive(G: nx.DiGraph, output_path: str = None) -> str:
    """Convenience function for interactive HTML rendering."""
    vis = OntologyVisualiser()
    return vis.render_pyvis(G, output_path)


def render_static(G: nx.DiGraph, output_path: str = None) -> str:
    """Convenience function for static image rendering."""
    vis = OntologyVisualiser()
    return vis.render_matplotlib(G, output_path)


if __name__ == "__main__":
    import sys
    from graph_builder import build_ontology_graph

    if len(sys.argv) < 2:
        print("Usage: python visualiser.py <ontology_file.json> [output.html|output.png]")
        sys.exit(1)

    G = build_ontology_graph(sys.argv[1])
    output = sys.argv[2] if len(sys.argv) > 2 else None

    vis = OntologyVisualiser()

    if output and output.endswith(('.png', '.svg', '.pdf')):
        path = vis.render_matplotlib(G, output)
        print(f"Static image saved: {path}")
    else:
        path = vis.render_pyvis(G, output)
        print(f"Interactive HTML saved: {path}")
