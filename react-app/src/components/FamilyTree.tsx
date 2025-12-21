import React, { Component } from "react";
import * as d3 from "d3"; // npm install d3 or yarn add d3
import * as f3 from "family-chart"; // npm install family-chart@0.9.0 or yarn add family-chart@0.9.0
import "family-chart/styles/family-chart.css";

interface FamilyTreeProps {}

export default class FamilyTree extends Component<FamilyTreeProps> {
  private cont = React.createRef<HTMLDivElement>();

  componentDidMount() {
    if (!this.cont.current) return;
    fetch("/data/family.json")
      .then((res) => res.json())
      .then((data) => this.create(data))
      .catch((err) => console.error(err));
  }

  create(data: any) {
    // Ensure all nodes have required properties
    const formattedData = data.map((node: any) => ({
      ...node,
      father: node.father || "", // Default to empty string if undefined
      mother: node.mother || "", // Default to empty string if undefined
      spouses: node.spouses || [], // Default to empty array if undefined
      children: node.children || [], // Default to empty array if undefined
    }));

    console.log("[DEBUG] Formatted Data:", formattedData);

    const f3Chart = f3
      .createChart("#FamilyChart", formattedData)
      .setTransitionTime(1000)
      .setCardXSpacing(250)
      .setCardYSpacing(150);

    const f3Card = f3Chart.setCardHtml().setCardDisplay([
      ["first name", "last name"],
      ["birthday"],
    ]);

    const f3EditTree = f3Chart
      .editTree()
      .setFields(["first name", "last name", "birthday"])
      .setEditFirst(true) // Open form on click
      .setCardClickOpen(f3Card);

    // Uncomment the following line to disable editing and only show info
    // .setNoEdit();

    f3EditTree.open(f3Chart.getMainDatum());
    f3Chart.updateTree({ initial: true });

    // Add Save button to f3-history control
    const historyControl = document.querySelector(".f3-history-controls");
    if (historyControl) {
      const saveButton = document.createElement("button");
      saveButton.className = "f3-save-button f3-btn";

      // Replace Save button text with an icon
      const saveIcon = document.createElement("i");
      // Update Save button icon to a disk-like save icon
      saveIcon.className = "fa-solid fa-floppy-disk"; // Font Awesome disk-like save icon class
      saveButton.textContent = ""; // Clear existing text
      saveButton.appendChild(saveIcon);

      // Align Save button icon with Back and Forward buttons
      saveButton.style.display = "inline-flex"; // Match button alignment style
      saveButton.style.alignItems = "center"; // Center icon vertically
      saveButton.style.justifyContent = "center"; // Center icon horizontally
      saveButton.style.marginLeft = "8px"; // Add spacing to align with other buttons

      // Move Save button to the top of the container
      saveButton.style.position = "absolute"; // Position it absolutely
      // Adjust Save button position to avoid overlapping with Forward button
      //saveButton.style.right = "50px"; // Move it further to the right

      // Flip Save button colors: white icon, black background
      // Match Save button background color to the page background
      saveButton.style.backgroundColor = "rgb(33,33,33)"; // Set to page background color
      saveButton.style.color = "white"; // Set icon color to white

      // Remove border and adjust icon size to match Back and Forward buttons
      saveButton.style.border = "none"; // Remove border
      saveButton.style.fontSize = "20px"; // Match font size to Back and Forward buttons
      saveButton.style.width = "40px"; // Match width to other buttons
      saveButton.style.height = "30px"; // Match height to other buttons

      // Remove box shadow from the Save button
      saveButton.style.boxShadow = "none";

      historyControl.appendChild(saveButton);

      // Attach click event to Save button to save f3Chart data
      saveButton.addEventListener("click", () => {
        // Export tree data
        const treeData = f3EditTree.exportData();
        
        // Update filtering logic to check for first and last name inside node.data
        const filteredTreeData = treeData.filter(
          (node: any) => node.data && (node.data["first name"] || node.data["last name"])
        );
        
        // Prevent saving if filteredTreeData is empty
        if (filteredTreeData.length === 0) {
          console.error("[ERROR] No valid nodes to save. Ensure all nodes have both first and last names.");
          return;
        }

        // Save filtered tree data to family.json
        fetch("http://localhost:3001/api/save-family", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredTreeData),
        })
          .then((response) => {
            if (response.ok) {
              console.log("[DEBUG] Tree data saved successfully");
            } else {
              console.error("[ERROR] Failed to save tree data");
            }
          })
          .catch((error) => {
            console.error("[ERROR] Error saving tree data:", error);
          });
      });

      console.log("[DEBUG] Save button added to f3-history control");
    } else {
      console.error("[ERROR] f3-history control not found");
    }
  }

  render() {
    return (
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
    );
  }
}
