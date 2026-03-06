#!/usr/bin/env python3
"""
VHF Ontology Tools - Test Suite (CC-108)
Unit tests for ontology loader, graph builder, and visualiser.

Usage:
    python test_ontology_tools.py           # Run all tests
    python -m pytest test_ontology_tools.py # Run with pytest (verbose)
"""

import sys
import json
import unittest
from pathlib import Path
from tempfile import NamedTemporaryFile, TemporaryDirectory

# Add tools to path
sys.path.insert(0, str(Path(__file__).parent))

from ontology_loader import (
    OntologyLoader, Ontology, Entity, Relationship, load_ontology
)
from graph_builder import (
    OntologyGraphBuilder, build_ontology_graph, get_graph_stats
)
from visualiser import OntologyVisualiser
from ve_domain_graphs import VEDomainGraphBuilder, W4MFramework


class TestOntologyLoader(unittest.TestCase):
    """Tests for ontology_loader.py"""

    def setUp(self):
        self.loader = OntologyLoader()

    def test_parse_standard_format(self):
        """Test parsing standard JSON-LD format with classes."""
        data = {
            "@context": {"@vocab": "https://schema.org/"},
            "@id": "test:ontology",
            "name": "Test Ontology",
            "version": "1.0.0",
            "description": "Test description",
            "classes": {
                "Person": {
                    "@id": "schema:Person",
                    "rdfs:label": "Person",
                    "rdfs:comment": "A human being",
                    "properties": {"name": "schema:name"}
                }
            },
            "relationships": {
                "knows": {
                    "@id": "schema:knows",
                    "rdfs:label": "knows",
                    "rdfs:domain": "schema:Person",
                    "rdfs:range": "schema:Person"
                }
            }
        }

        ontology = self.loader.parse_ontology(data, "test.json")

        self.assertEqual(ontology.name, "Test Ontology")
        self.assertEqual(ontology.version, "1.0.0")
        self.assertEqual(len(ontology.entities), 1)
        self.assertEqual(ontology.entities[0].label, "Person")
        self.assertEqual(len(ontology.relationships), 1)

    def test_parse_registry_format(self):
        """Test parsing registry entry format."""
        data = {
            "@context": {"@vocab": "https://schema.org/"},
            "@id": "registry:entry:test",
            "registryEntry": {
                "ontologyId": "test:ont",
                "version": "2.0.0",
                "domain": "Testing",
                "entities": {"count": 3, "list": ["A", "B", "C"]},
                "relationships": {"count": 2, "list": ["rel1", "rel2"]}
            }
        }

        ontology = self.loader.parse_ontology(data, "registry.json")

        self.assertEqual(ontology.version, "2.0.0")
        self.assertEqual(len(ontology.entities), 3)
        self.assertEqual(len(ontology.relationships), 2)

    def test_load_file_json(self):
        """Test loading ontology from JSON file."""
        test_data = {
            "@context": {"@vocab": "https://schema.org/"},
            "name": "File Test",
            "version": "1.0.0",
            "classes": {"Test": {"@id": "test:Test", "rdfs:label": "Test"}}
        }

        with NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(test_data, f)
            f.flush()

            ontology = load_ontology(f.name)
            self.assertEqual(ontology.name, "File Test")

    def test_entity_dataclass(self):
        """Test Entity dataclass creation."""
        entity = Entity(
            id="test:Entity",
            label="Test Entity",
            description="A test entity",
            entity_type="Core",
            properties={"prop1": "value1"}
        )

        self.assertEqual(entity.id, "test:Entity")
        self.assertEqual(entity.label, "Test Entity")
        self.assertEqual(entity.entity_type, "Core")

    def test_relationship_dataclass(self):
        """Test Relationship dataclass creation."""
        rel = Relationship(
            id="rel:test",
            label="testRelation",
            source="A",
            target="B",
            cardinality="1:*"
        )

        self.assertEqual(rel.source, "A")
        self.assertEqual(rel.target, "B")
        self.assertEqual(rel.cardinality, "1:*")


class TestGraphBuilder(unittest.TestCase):
    """Tests for graph_builder.py"""

    def setUp(self):
        self.builder = OntologyGraphBuilder()

    def test_build_graph_from_ontology(self):
        """Test building graph from Ontology object."""
        ontology = Ontology(
            id="test:ont",
            name="Test Graph",
            version="1.0.0",
            description="Test",
            context={},
            entities=[
                Entity("A", "Node A", "First node"),
                Entity("B", "Node B", "Second node"),
            ],
            relationships=[
                Relationship("r1", "connects", "A", "B")
            ]
        )

        G = self.builder.build_graph(ontology)

        self.assertEqual(G.number_of_nodes(), 2)
        self.assertEqual(G.number_of_edges(), 1)
        self.assertTrue(G.has_edge("A", "B"))

    def test_graph_metadata(self):
        """Test that graph metadata is preserved."""
        ontology = Ontology(
            id="test:meta",
            name="Metadata Test",
            version="2.0.0",
            description="Testing metadata",
            context={},
            entities=[Entity("X", "X", "")],
            relationships=[]
        )

        G = self.builder.build_graph(ontology)

        self.assertEqual(G.graph['name'], "Metadata Test")
        self.assertEqual(G.graph['version'], "2.0.0")

    def test_node_attributes(self):
        """Test that node attributes are set correctly."""
        ontology = Ontology(
            id="test:attr",
            name="Attributes",
            version="1.0.0",
            description="",
            context={},
            entities=[
                Entity("node1", "Test Node", "Description", "Core")
            ],
            relationships=[]
        )

        G = self.builder.build_graph(ontology)

        self.assertEqual(G.nodes["node1"]["label"], "Test Node")
        self.assertEqual(G.nodes["node1"]["entity_type"], "Core")
        self.assertEqual(G.nodes["node1"]["node_type"], "entity")

    def test_get_graph_stats(self):
        """Test graph statistics function."""
        ontology = Ontology(
            id="test:stats",
            name="Stats Test",
            version="1.0.0",
            description="",
            context={},
            entities=[
                Entity("A", "A", ""),
                Entity("B", "B", ""),
                Entity("C", "C", ""),
            ],
            relationships=[
                Relationship("r1", "r", "A", "B"),
                Relationship("r2", "r", "B", "C"),
            ]
        )

        G = self.builder.build_graph(ontology)
        stats = get_graph_stats(G)

        self.assertEqual(stats['nodes'], 3)
        self.assertEqual(stats['edges'], 2)
        self.assertTrue(stats['is_dag'])


class TestVisualiser(unittest.TestCase):
    """Tests for visualiser.py"""

    def setUp(self):
        self.vis = OntologyVisualiser()
        self.builder = OntologyGraphBuilder()

    def _create_test_graph(self):
        """Create a simple test graph."""
        ontology = Ontology(
            id="test:vis",
            name="Vis Test",
            version="1.0.0",
            description="",
            context={},
            entities=[
                Entity("A", "Node A", "First", "Core"),
                Entity("B", "Node B", "Second", "Framework"),
            ],
            relationships=[
                Relationship("r1", "links", "A", "B")
            ]
        )
        return self.builder.build_graph(ontology)

    def test_filter_by_domain(self):
        """Test domain filtering."""
        G = self._create_test_graph()

        # Should include connected nodes
        filtered = self.vis.filter_by_domain(G, "Core", include_connected=True)
        self.assertGreaterEqual(filtered.number_of_nodes(), 1)

    def test_highlight_path(self):
        """Test path highlighting."""
        G = self._create_test_graph()

        highlighted = self.vis.highlight_path(G, "A", "B")

        # Check that path nodes are highlighted
        self.assertTrue(highlighted.nodes["A"].get("highlighted", False))
        self.assertTrue(highlighted.nodes["B"].get("highlighted", False))

    def test_render_pyvis_creates_file(self):
        """Test PyVis rendering creates HTML file."""
        G = self._create_test_graph()

        with TemporaryDirectory() as tmpdir:
            output = Path(tmpdir) / "test.html"
            result = self.vis.render_pyvis(G, str(output))

            self.assertTrue(output.exists())
            self.assertEqual(result, str(output))


class TestVEDomainGraphs(unittest.TestCase):
    """Tests for ve_domain_graphs.py"""

    def setUp(self):
        self.builder = VEDomainGraphBuilder()

    def test_w4m_framework_layers(self):
        """Test W4M framework has 8 layers."""
        framework = W4MFramework()

        self.assertEqual(len(framework.LAYERS), 8)
        self.assertEqual(framework.LAYERS[0].name, "Problem Space")
        self.assertEqual(framework.LAYERS[7].name, "Strategy")

    def test_build_framework_graph(self):
        """Test building W4M framework graph."""
        G = self.builder.build_w4m_framework_graph()

        # Should have 8 layer nodes
        layer_nodes = [n for n in G.nodes() if n.startswith("layer_")]
        self.assertEqual(len(layer_nodes), 8)

        # Should have flow edges between consecutive layers
        self.assertTrue(G.has_edge("layer_0", "layer_1"))
        self.assertTrue(G.has_edge("layer_6", "layer_7"))

        # Should have feedback edges from strategy
        self.assertTrue(G.has_edge("layer_7", "layer_0"))

    def test_analyze_value_flow(self):
        """Test value flow analysis."""
        G = self.builder.build_w4m_framework_graph()

        analysis = self.builder.analyze_value_flow(G, 0, 7)

        self.assertEqual(analysis['source'], "Problem Space")
        self.assertEqual(analysis['target'], "Strategy")
        self.assertIn('paths', analysis)
        self.assertIn('metrics', analysis)


class TestIntegration(unittest.TestCase):
    """Integration tests across modules."""

    def test_end_to_end_pipeline(self):
        """Test complete pipeline: load -> build -> visualize."""
        # Create test JSON
        test_data = {
            "@context": {"@vocab": "https://schema.org/"},
            "name": "E2E Test",
            "version": "1.0.0",
            "classes": {
                "Customer": {"@id": "test:Customer", "rdfs:label": "Customer"},
                "Product": {"@id": "test:Product", "rdfs:label": "Product"}
            },
            "relationships": {
                "purchases": {
                    "@id": "test:purchases",
                    "rdfs:label": "purchases",
                    "rdfs:domain": "test:Customer",
                    "rdfs:range": "test:Product"
                }
            }
        }

        with NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(test_data, f)
            f.flush()

            # Load
            ontology = load_ontology(f.name)
            self.assertEqual(ontology.name, "E2E Test")

            # Build
            G = build_ontology_graph(f.name)
            self.assertEqual(G.number_of_nodes(), 2)

            # Stats
            stats = get_graph_stats(G)
            self.assertEqual(stats['nodes'], 2)

            # Visualize (just verify no errors)
            vis = OntologyVisualiser()
            with TemporaryDirectory() as tmpdir:
                output = Path(tmpdir) / "e2e.html"
                vis.render_pyvis(G, str(output))
                self.assertTrue(output.exists())


def run_tests():
    """Run all tests with verbose output."""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()

    # Add test classes
    suite.addTests(loader.loadTestsFromTestCase(TestOntologyLoader))
    suite.addTests(loader.loadTestsFromTestCase(TestGraphBuilder))
    suite.addTests(loader.loadTestsFromTestCase(TestVisualiser))
    suite.addTests(loader.loadTestsFromTestCase(TestVEDomainGraphs))
    suite.addTests(loader.loadTestsFromTestCase(TestIntegration))

    # Run with verbosity
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    return result.wasSuccessful()


if __name__ == "__main__":
    print("=" * 60)
    print("VHF Ontology Tools - Test Suite")
    print("=" * 60)
    print()

    success = run_tests()

    print()
    print("=" * 60)
    if success:
        print("ALL TESTS PASSED")
    else:
        print("SOME TESTS FAILED")
    print("=" * 60)

    sys.exit(0 if success else 1)
