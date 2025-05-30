"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as d3 from "d3";
import { Plus, Minus, RefreshCw } from "lucide-react";

interface SchemaEvolutionTimelineProps {
  versions: any[];
}

export function SchemaEvolutionTimeline({
  versions,
}: SchemaEvolutionTimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || versions.length === 0) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 40, right: 30, bottom: 40, left: 50 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "var(--background)")
      .style("border", "1px solid var(--border)")
      .style("border-radius", "var(--radius)")
      .style("padding", "8px")
      .style("box-shadow", "0 2px 10px rgba(0, 0, 0, 0.1)")
      .style("pointer-events", "none")
      .style("z-index", "10");

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(versions, (d) => new Date(d.timestamp)) as [Date, Date])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(versions, (d) => d.fields.length) as number])
      .nice()
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y).ticks(5);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "10px");

    // Add Y axis
    svg.append("g").call(yAxis).selectAll("text").style("font-size", "10px");

    // Add Y axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "var(--muted-foreground)")
      .text("Number of Fields");

    // Create line generator
    const line = d3
      .line<any>()
      .x((d) => x(new Date(d.timestamp)))
      .y((d) => y(d.fields.length))
      .curve(d3.curveMonotoneX);

    // Add the line
    svg
      .append("path")
      .datum(versions)
      .attr("fill", "none")
      .attr("stroke", "var(--primary)")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    svg
      .selectAll(".dot")
      .data(versions)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(new Date(d.timestamp)))
      .attr("cy", (d) => y(d.fields.length))
      .attr("r", 5)
      .attr("fill", "var(--primary)")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("fill", "var(--accent)");

        tooltip
          .style("visibility", "visible")
          .html(
            `
            <div class="space-y-1">
              <div class="font-medium">Version ${d.version}</div>
              <div class="text-xs text-muted-foreground">${new Date(d.timestamp).toLocaleDateString()}</div>
              <div class="text-sm">${d.fields.length} fields</div>
            </div>
          `
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 5)
          .attr("fill", "var(--primary)");

        tooltip.style("visibility", "hidden");
      });

    // Add version labels
    svg
      .selectAll(".version-label")
      .data(versions)
      .enter()
      .append("text")
      .attr("class", "version-label")
      .attr("x", (d) => x(new Date(d.timestamp)))
      .attr("y", (d) => y(d.fields.length) - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "var(--muted-foreground)")
      .text((d) => `v${d.version}`);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "var(--border)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "3,3");

    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "var(--border)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "3,3");

    // Add annotations for significant changes
    for (let i = 1; i < versions.length; i++) {
      const prevVersion = versions[i - 1];
      const currVersion = versions[i];

      const addedFields = currVersion.fields.filter(
        (f: any) => !prevVersion.fields.some((pf: any) => pf.id === f.id)
      );

      const removedFields = prevVersion.fields.filter(
        (f: any) => !currVersion.fields.some((cf: any) => cf.id === f.id)
      );

      if (addedFields.length > 0 || removedFields.length > 0) {
        svg
          .append("g")
          .attr("class", "annotation")
          .append("rect")
          .attr("x", x(new Date(currVersion.timestamp)) - 20)
          .attr("y", y(currVersion.fields.length) - 40)
          .attr("width", 40)
          .attr("height", 20)
          .attr("rx", 4)
          .attr("fill", "var(--accent)")
          .attr("fill-opacity", 0.2)
          .attr("stroke", "var(--accent)")
          .attr("stroke-width", 1);

        svg
          .append("text")
          .attr("x", x(new Date(currVersion.timestamp)))
          .attr("y", y(currVersion.fields.length) - 25)
          .attr("text-anchor", "middle")
          .style("font-size", "9px")
          .style("fill", "var(--accent-foreground)")
          .text(`+${addedFields.length} -${removedFields.length}`);
      }
    }
  }, [versions]);

  return (
    <div className="space-y-4">
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Schema Evolution Timeline</h3>
              <Badge variant="outline">{versions.length} versions</Badge>
            </div>

            <div className="relative h-[400px] w-full">
              <svg ref={svgRef} width="100%" height="400" />
              <div ref={tooltipRef} />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                This chart shows how the schema has evolved over time, tracking
                the number of fields in each version.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Field Evolution Summary</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {versions.map((version, index) => {
                const prevVersion = index > 0 ? versions[index - 1] : null;
                const addedFields = prevVersion
                  ? version.fields.filter(
                      (f: any) =>
                        !prevVersion.fields.some((pf: any) => pf.id === f.id)
                    )
                  : [];
                const removedFields = prevVersion
                  ? prevVersion.fields.filter(
                      (f: any) =>
                        !version.fields.some((cf: any) => cf.id === f.id)
                    )
                  : [];
                const modifiedFields = prevVersion
                  ? version.fields.filter((f: any) => {
                      const prevField = prevVersion.fields.find(
                        (pf: any) => pf.id === f.id
                      );
                      return (
                        prevField &&
                        (prevField.type !== f.type ||
                          prevField.required !== f.required ||
                          prevField.name !== f.name)
                      );
                    })
                  : [];

                return (
                  <Card key={version.id} className="border-border/40">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant={
                              index === versions.length - 1
                                ? "default"
                                : "outline"
                            }
                          >
                            v{version.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(version.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="pt-2">
                          <div className="text-sm">
                            Total Fields:{" "}
                            <span className="font-medium">
                              {version.fields.length}
                            </span>
                          </div>

                          {index > 0 && (
                            <div className="mt-2 space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <Plus className="h-3 w-3 text-[oklch(0.5_0.2_140)]" />
                                <span>Added: {addedFields.length}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Minus className="h-3 w-3 text-[oklch(0.5_0.2_30)]" />
                                <span>Removed: {removedFields.length}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3 text-[oklch(0.5_0.2_280)]" />
                                <span>Modified: {modifiedFields.length}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
