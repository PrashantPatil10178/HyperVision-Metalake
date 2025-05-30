"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Badge } from "@/components/ui/badge";

interface BranchGraphProps {
  metadata: any;
}

interface Node {
  id: string;
  label: string;
  type: string;
  timestamp: number;
  branch?: string;
}

interface Link {
  source: string;
  target: string;
  type: string;
}

export function BranchGraph({ metadata }: BranchGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(svgRef.current.parentElement!);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0)
      return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Create nodes and links from metadata
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Add snapshot nodes
    metadata.snapshots?.forEach((snapshot: any) => {
      // Find which branch this snapshot belongs to
      let branch = "main";
      Object.entries(metadata.refs || {}).forEach(
        ([branchName, ref]: [string, any]) => {
          if (ref["snapshot-id"] === snapshot["snapshot-id"]) {
            branch = branchName;
          }
        }
      );

      nodes.push({
        id: `snapshot-${snapshot["snapshot-id"]}`,
        label: `Snapshot ${snapshot["sequence-number"]}`,
        type: "snapshot",
        timestamp: snapshot["timestamp-ms"],
        branch,
      });

      // If not the first snapshot, link to previous
      if (snapshot["sequence-number"] > 1) {
        const prevSnapshot = metadata.snapshots.find(
          (s: any) => s["sequence-number"] === snapshot["sequence-number"] - 1
        );
        if (prevSnapshot) {
          links.push({
            source: `snapshot-${prevSnapshot["snapshot-id"]}`,
            target: `snapshot-${snapshot["snapshot-id"]}`,
            type: "snapshot",
          });
        }
      }
    });

    // Add branch nodes
    Object.entries(metadata.refs || {}).forEach(
      ([branchName, ref]: [string, any]) => {
        nodes.push({
          id: `branch-${branchName}`,
          label: branchName,
          type: "branch",
          timestamp:
            metadata.snapshots?.find(
              (s: any) => s["snapshot-id"] === ref["snapshot-id"]
            )?.["timestamp-ms"] || 0,
        });

        // Link branch to its snapshot
        links.push({
          source: `snapshot-${ref["snapshot-id"]}`,
          target: `branch-${branchName}`,
          type: "branch",
        });
      }
    );

    // Create the SVG
    const svg = d3.select(svgRef.current);

    // Define arrow marker
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#888");

    // Create a force simulation
    const simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id((d: any) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
      )
      .force("x", d3.forceX(dimensions.width / 2).strength(0.1))
      .force("y", d3.forceY(dimensions.height / 2).strength(0.1));

    // Create the links
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d) => (d.type === "branch" ? "#888" : "#aaa"))
      .attr("stroke-width", (d) => (d.type === "branch" ? 2 : 1.5))
      .attr("stroke-dasharray", (d) => (d.type === "branch" ? "3,3" : "none"))
      .attr("marker-end", "url(#arrowhead)");

    // Create the nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", (d) => (d.type === "branch" ? 25 : 20))
      .attr("fill", (d) => {
        if (d.type === "branch") {
          if (d.label === "main") return "hsl(220, 70%, 50%)";
          if (d.label.startsWith("feature")) return "hsl(150, 70%, 50%)";
          return "hsl(280, 70%, 50%)";
        } else {
          return d.branch === "main"
            ? "hsl(220, 60%, 80%)"
            : d.branch?.startsWith("feature")
              ? "hsl(150, 60%, 80%)"
              : "hsl(280, 60%, 80%)";
        }
      })
      .attr("stroke", (d) => {
        if (d.type === "branch") {
          if (d.label === "main") return "hsl(220, 70%, 40%)";
          if (d.label.startsWith("feature")) return "hsl(150, 70%, 40%)";
          return "hsl(280, 70%, 40%)";
        } else {
          return d.branch === "main"
            ? "hsl(220, 60%, 60%)"
            : d.branch?.startsWith("feature")
              ? "hsl(150, 60%, 60%)"
              : "hsl(280, 60%, 60%)";
        }
      })
      .attr("stroke-width", 2);

    // Add labels to nodes
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.type === "branch" ? "0.3em" : "0.3em"))
      .attr("font-size", (d) => (d.type === "branch" ? "10px" : "9px"))
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text((d) => (d.type === "branch" ? d.label : d.label.split(" ")[1]));

    // Add tooltips
    node.append("title").text((d) => {
      const date = new Date(d.timestamp).toLocaleString();
      return `${d.label}\nTimestamp: ${date}`;
    });

    // Update positions on simulation tick
    simulation.nodes(nodes as any).on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    simulation.force<d3.ForceLink<any, any>>("link")!.links(links as any);

    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Add legend
    const legend = svg.append("g").attr("transform", `translate(20, 20)`);

    const legendData = [
      { label: "Main Branch", color: "hsl(220, 70%, 50%)" },
      { label: "Feature Branch", color: "hsl(150, 70%, 50%)" },
      { label: "Dev Branch", color: "hsl(280, 70%, 50%)" },
      { label: "Snapshot", color: "hsl(220, 60%, 80%)" },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("circle")
        .attr("r", 6)
        .attr("fill", item.color)
        .attr("stroke", d3.color(item.color)!.darker().toString())
        .attr("stroke-width", 1);

      legendRow
        .append("text")
        .attr("x", 15)
        .attr("y", 4)
        .attr("font-size", "10px")
        .attr("fill", "currentColor")
        .text(item.label);
    });

    return () => {
      simulation.stop();
    };
  }, [metadata, dimensions]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="overflow-visible"
      />
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
          Drag nodes to reposition
        </Badge>
      </div>
    </div>
  );
}
