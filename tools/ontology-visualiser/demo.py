#!/usr/bin/env python3
"""
VHF Ontology Visualiser - Browser Demo (CC-107)
Generates interactive HTML visualizations that open in browser.

Usage:
    python demo.py                    # Demo with sample data
    python demo.py <ontology.json>    # Visualize specific ontology
    python demo.py --framework        # Show W4M framework only
"""

import sys
import json
import webbrowser
from pathlib import Path
from datetime import datetime

# Add tools to path
sys.path.insert(0, str(Path(__file__).parent))

from ontology_loader import OntologyLoader, Ontology, Entity, Relationship
from graph_builder import OntologyGraphBuilder, get_graph_stats
from visualiser import OntologyVisualiser
from ve_domain_graphs import VEDomainGraphBuilder, W4MFramework


def create_sample_ontology() -> Ontology:
    """Create a sample VE ontology for demo purposes."""
    entities = [
        Entity("org:Organization", "Organization", "Business entity", "Core"),
        Entity("vsom:Vision", "Vision", "Long-term aspirational state", "Framework"),
        Entity("vsom:Strategy", "Strategy", "Approach to achieve vision", "Framework"),
        Entity("vsom:Objective", "Objective", "Measurable goal", "Framework"),
        Entity("vsom:Metric", "Metric", "KPI measurement", "Framework"),
        Entity("ve:ValueProposition", "Value Proposition", "Unique value delivery", "Core"),
        Entity("ve:ICP", "Ideal Customer Profile", "Target customer definition", "Core"),
        Entity("ve:BusinessModel", "Business Model", "Revenue and cost structure", "Core"),
        Entity("agent:OAA", "Ontology Architect Agent", "Creates and validates ontologies", "Agent"),
    ]

    relationships = [
        Relationship("r1", "hasVision", "org:Organization", "vsom:Vision", "1:1"),
        Relationship("r2", "definesStrategy", "vsom:Vision", "vsom:Strategy", "1:*"),
        Relationship("r3", "setsObjective", "vsom:Strategy", "vsom:Objective", "1:*"),
        Relationship("r4", "measuredBy", "vsom:Objective", "vsom:Metric", "1:*"),
        Relationship("r5", "targetsICP", "org:Organization", "ve:ICP", "1:1"),
        Relationship("r6", "offersValue", "org:Organization", "ve:ValueProposition", "1:*"),
        Relationship("r7", "operatesModel", "org:Organization", "ve:BusinessModel", "1:1"),
        Relationship("r8", "validatesOntology", "agent:OAA", "org:Organization", "1:*"),
    ]

    return Ontology(
        id="demo:vhf-sample-ontology",
        name="VHF Sample Ontology",
        version="1.0.0",
        description="Sample VE ontology demonstrating VSOM framework",
        context={"@vocab": "https://schema.org/"},
        entities=entities,
        relationships=relationships,
        business_rules=[
            {"id": "BR1", "rule": "Every Organization must have a Vision"},
            {"id": "BR2", "rule": "Strategy must align with Vision"},
            {"id": "BR3", "rule": "Objectives must be measurable by Metrics"},
        ]
    )


def generate_demo_html(ontology: Ontology, output_dir: Path) -> str:
    """Generate interactive HTML demo."""
    builder = OntologyGraphBuilder()
    vis = OntologyVisualiser(height="700px")

    # Build main graph
    G = builder.build_graph(ontology)

    # Generate timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Generate visualization
    html_path = output_dir / "ontology_demo.html"
    vis.render_pyvis(G, str(html_path), physics=True)

    # Enhance HTML with header
    with open(html_path, 'r') as f:
        html_content = f.read()

    # Add custom header
    stats = get_graph_stats(G)
    header_html = f'''
    <div style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
                color: white; padding: 20px; font-family: system-ui, sans-serif;">
        <h1 style="margin: 0;">VHF Ontology Visualiser</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">
            <strong>{ontology.name}</strong> v{ontology.version}
        </p>
        <div style="margin-top: 10px; display: flex; gap: 20px; font-size: 14px;">
            <span>Nodes: {stats['nodes']}</span>
            <span>Edges: {stats['edges']}</span>
            <span>Density: {stats['density']:.3f}</span>
            <span style="opacity: 0.7;">Generated: {timestamp}</span>
        </div>
    </div>
    '''

    # Insert header after <body>
    enhanced_html = html_content.replace('<body>', f'<body>\n{header_html}')

    with open(html_path, 'w') as f:
        f.write(enhanced_html)

    return str(html_path)


def generate_framework_html(output_dir: Path) -> str:
    """Generate W4M framework visualization."""
    builder = VEDomainGraphBuilder()
    vis = OntologyVisualiser(height="700px")

    # Build framework graph
    G = builder.build_w4m_framework_graph()

    # Generate visualization
    html_path = output_dir / "w4m_framework.html"
    vis.render_pyvis(G, str(html_path), physics=False)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Enhance HTML
    with open(html_path, 'r') as f:
        html_content = f.read()

    header_html = f'''
    <div style="background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
                color: white; padding: 20px; font-family: system-ui, sans-serif;">
        <h1 style="margin: 0;">W4M Business Framework</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">
            8-Layer Value Engineering Framework
        </p>
        <div style="margin-top: 10px; font-size: 14px; opacity: 0.7;">
            Generated: {timestamp}
        </div>
    </div>
    '''

    enhanced_html = html_content.replace('<body>', f'<body>\n{header_html}')

    with open(html_path, 'w') as f:
        f.write(enhanced_html)

    return str(html_path)


def run_demo(ontology_path: str = None, framework_only: bool = False):
    """Run the browser demo."""
    output_dir = Path(__file__).parent.parent / "demo_output"
    output_dir.mkdir(exist_ok=True)

    print("=" * 50)
    print("VHF Ontology Visualiser - Browser Demo")
    print("=" * 50)

    if framework_only:
        print("\nGenerating W4M Framework visualization...")
        html_path = generate_framework_html(output_dir)
    elif ontology_path:
        print(f"\nLoading ontology: {ontology_path}")
        loader = OntologyLoader()
        ontology = loader.load_file(ontology_path)
        print(f"  Name: {ontology.name}")
        print(f"  Entities: {len(ontology.entities)}")
        print(f"  Relationships: {len(ontology.relationships)}")
        print("\nGenerating visualization...")
        html_path = generate_demo_html(ontology, output_dir)
    else:
        print("\nUsing sample VE ontology...")
        ontology = create_sample_ontology()
        print(f"  Name: {ontology.name}")
        print(f"  Entities: {len(ontology.entities)}")
        print(f"  Relationships: {len(ontology.relationships)}")
        print("\nGenerating visualization...")
        html_path = generate_demo_html(ontology, output_dir)

    print(f"\nOutput: {html_path}")
    print("\nOpening in browser...")

    # Open in browser
    webbrowser.open(f"file://{html_path}")

    print("\nDemo complete!")
    print("=" * 50)

    return html_path


if __name__ == "__main__":
    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        sys.exit(0)

    framework_only = "--framework" in sys.argv
    ontology_path = None

    for arg in sys.argv[1:]:
        if arg.endswith('.json') and Path(arg).exists():
            ontology_path = arg
            break

    run_demo(ontology_path, framework_only)
