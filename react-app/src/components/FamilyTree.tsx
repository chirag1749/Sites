import React, { Component } from "react";
import * as d3 from "d3";
import * as f3 from "family-chart";
import "family-chart/styles/family-chart.css";

interface FamilyTreeProps {
  onChartReady?: (f3Chart: any) => void;
}

export default class FamilyTree extends Component<FamilyTreeProps> {
  private cont = React.createRef<HTMLDivElement>();
  isInEditMode = false;
  showChildrenSpouses = false;
  f3Chart: any = null;

  componentDidMount() {
    // Set edit mode from query string
    const params = new URLSearchParams(window.location.search);
    this.isInEditMode = params.get("edit") === "true";


    if (!this.cont.current) return;
    fetch("/Sites/data/family.json")
      .then((res) => res.json())
      .then((data) => this.create(data))
      .catch((err) => console.error(err));
  }

  create(data: any) {
    const mainIdSpouse = 'b4e33c68-20a7-47ba-9dcc-1168a07d5b52';
    const mainId = 'ce2fcb9a-6058-4326-b56a-aced35168561';

    // Helper to clean up rels arrays so they only contain valid ids
    const validIds = new Set(data.map((n: any) => n.id));
    const cleanRels = (rels: any) => {
      if (!rels) return { spouses: [], children: [], parents: [] };
      const clean = (arr: any) => Array.isArray(arr) ? arr.filter((id: any) => id && validIds.has(id)) : [];
      return {
        spouses: clean(rels.spouses),
        children: clean(rels.children),
        parents: clean(rels.parents)
      };
    };

    // Helper to get formatted data
    function getFormattedData(inputData: any[], showChildrenSpouses: boolean) {

      if (showChildrenSpouses) {
        return inputData.map((node: any) => ({
          ...node,
          father: node.father || "", // Default to empty string if undefined
          mother: node.mother || "", // Default to empty string if undefined
          spouses: node.spouses || [], // Default to empty array if undefined
          children: node.children || [], // Default to empty array if undefined
          rels: cleanRels(node.rels)
        }));
      }
      else {
        return inputData.map((node: any) => {
          const isChild = node.rels && Array.isArray(node.rels.parents) && node.rels.parents.length > 0;
          const isMain = node.id === mainId || node.id === mainIdSpouse;

          if (isMain) {
            return {
              ...node,
              father: node.father || "",
              mother: node.mother || "",
              spouses: node.spouses || [],
              children: node.children || [],
              rels: {
                ...node.rels,
                spouses: node.rels.spouses || []
              }
            };
          } else if (isChild) {
            return {
              ...node,
              father: node.father || "",
              mother: node.mother || "",
              spouses: showChildrenSpouses ? node.spouses || [] : [],
              children: node.children || [],
              rels: {
                ...node.rels,
                spouses: showChildrenSpouses ? node.rels.spouses || [] : []
              }
            };
          } else {
            return {
              ...node,
              father: node.father || "",
              mother: node.mother || "",
              spouses: node.spouses || [],
              children: node.children || [],
              rels: {
                ...node.rels,
                spouses: node.rels.spouses || []
              }
            };
          }
        });
      }
    }

    if (this.isInEditMode) {
      this.showChildrenSpouses = true;
    }
    let formattedData = getFormattedData(data, this.showChildrenSpouses);

    console.log("[DEBUG] Formatted Data:", formattedData);


    const isMobile = window.innerWidth <= 600;
    let chartBuilder = f3
      .createChart("#FamilyChart", formattedData)
      .setTransitionTime(1000)
      .setCardXSpacing(250)
      .setCardYSpacing(120)
      .setSingleParentEmptyCard(false)
      .setAncestryDepth(1)
      .setProgenyDepth(1);
    if (isMobile && window.innerHeight > window.innerWidth) {
      chartBuilder = chartBuilder.setOrientationHorizontal();
    } else if (isMobile && window.innerWidth >= window.innerHeight) {
      if (typeof chartBuilder.setOrientationVertical === 'function') {
        chartBuilder = chartBuilder.setOrientationVertical();
      }
    }
    this.f3Chart = chartBuilder;
    const f3Chart = this.f3Chart;

    // Listen for orientation change or resize and rebuild chart with correct orientation
    if (isMobile) {
      window.addEventListener('resize', () => {
        if (!this.f3Chart) return;
        if (window.innerHeight > window.innerWidth) {
          if (typeof this.f3Chart.setOrientationHorizontal === 'function') {
            this.f3Chart.setOrientationHorizontal();
            this.f3Chart.updateTree();
          }
        } else {
          if (typeof this.f3Chart.setOrientationVertical === 'function') {
            this.f3Chart.setOrientationVertical();
            this.f3Chart.updateTree();
          }
        }
        // Center the chart after orientation change
        setTimeout(() => {
          const chartDiv = document.getElementById('FamilyChart');
          if (chartDiv && chartDiv.parentElement) {
            //chartDiv.parentElement.scrollLeft = (chartDiv.scrollWidth - chartDiv.parentElement.clientWidth) / 2;
            chartDiv.parentElement.scrollTop = (chartDiv.scrollHeight - chartDiv.parentElement.clientHeight) / 2;
          }
        }, 300);
      });
    }

    const f3Card = f3Chart.setCardHtml()
      .setCardDisplay([
        ["first name", "last name"],
        ["birthday"],
      ])
      .setMiniTree(true)
      .setOnHoverPathToMain();

    const f3EditTree = f3Chart.editTree()
      .setFields(["first name", "last name", "birthday", "avatar"])
      .setEditFirst(true);

    if (!this.isInEditMode) {
      f3EditTree.setNoEdit();
    }
    else {
      f3EditTree.setCardClickOpen(f3Card);
    }

    const baseCardClick = f3Card.onCardClick;

    // Add click event to each card to log name and id
    f3Card.setOnCardClick((e: MouseEvent, d: any) => {

      //const firstName = d?.data?.data?.["first name"] || "";
      //const lastName = d?.data?.data?.["last name"] || "";
      const id = d?.data?.id || "";
      baseCardClick.call(f3Card, e, d);

      if (d.data.rels.children.length > 7 || id === "0") {
        f3Chart.setProgenyDepth(1);
        if (id === "0") {
          this.showChildrenSpouses = true;
        }
        else {
          this.showChildrenSpouses = false;
        }

      }
      else {
        f3Chart.setProgenyDepth(3);
        this.showChildrenSpouses = true;
      }

      if (!this.isInEditMode) {
        formattedData = getFormattedData(data, this.showChildrenSpouses);
        f3Chart.updateData(formattedData);
      }

      f3Chart.updateTree();
      //console.log("[CARD CLICK F3 RAW:", f3Chart);
    });

    f3Chart.updateMainId(mainIdSpouse)
    //f3EditTree.open(f3Chart.getMainDatum());
    f3Chart.updateTree({ initial: true });

    // Notify parent that chart and controls are ready, pass f3Chart instance
    if (this.props.onChartReady) {
      this.props.onChartReady(this.f3Chart);
    }
  }

  render() {
    return (
      <div className="family-tree-container">
        <div
          className="f3"
          id="FamilyChart"
          ref={this.cont}
          style={{
            width: "100%",
            height: "900px",
            margin: "auto",
            backgroundColor: "rgb(33,33,33)",
            color: "#fff",
          }}
        ></div>
      </div>
    );
  }
}
