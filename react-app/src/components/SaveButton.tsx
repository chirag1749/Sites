import { useEffect } from "react";
import "./SaveButton.css";

interface SaveButtonProps {
  f3Chart: any;
}

export default function SaveButton({ f3Chart }: SaveButtonProps) {
  useEffect(() => {
    function attachSaveButton() {
      const historyControl = document.querySelector(".f3-history-controls");
      if (historyControl) {
        // Remove any existing save button before appending
        const existing = historyControl.querySelector(".f3-save-button");
        if (existing) return;
        // Create save button
        const saveButton = document.createElement("button");
        saveButton.className = "f3-save-button f3-btn custom-save-btn";
        const saveIcon = document.createElement("i");
        saveIcon.className = "fa-solid fa-floppy-disk custom-save-icon";
        saveButton.appendChild(saveIcon);
        saveButton.title = "Save Family Tree";
        saveButton.onclick = async () => {
          if (!f3Chart) return;
          const f3EditTree = f3Chart.editTree();
          const treeData = f3EditTree.exportData();
          const filteredTreeData = treeData.filter(
            (node: any) => node.data && (node.data["first name"] || node.data["last name"])
          );
          if (filteredTreeData.length === 0) {
            console.error("[ERROR] No valid nodes to save. Ensure all nodes have both first and last names.");
            return;
          }
          try {
            const response = await fetch("http://localhost:3001/api/save-family", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(filteredTreeData),
            });
            if (response.ok) {
              console.log("[DEBUG] Tree data saved successfully");
            } else {
              console.error("[ERROR] Failed to save tree data");
            }
          } catch (error) {
            console.error("[ERROR] Error saving tree data:", error);
          }
        };
        historyControl.appendChild(saveButton);
      }
    }
    attachSaveButton();

    // MutationObserver to remove extra .f3-history-controls divs
    const navCont = document.querySelector('.f3-nav-cont');
    let observer: MutationObserver | null = null;
    if (navCont) {
      observer = new MutationObserver(() => {
        // Remove all but the first .f3-history-controls if they have 2 or fewer child elements
        const controls = navCont.querySelectorAll('.f3-history-controls');
        controls.forEach((ctrl, idx) => {
          //console.log(`[DEBUG] Checking .f3-history-controls #${idx} with ${ctrl.children.length} children`, ctrl);
          // Only remove if idx > 0 and ctrl has 2 or fewer children and is not visible (opacity: 0 or pointer-events: none)
          const style = window.getComputedStyle(ctrl);
          const isHidden = style.opacity === "0" || style.pointerEvents === "none";
          if (ctrl.parentNode && ctrl.children.length <= 2 && isHidden) {
            //console.log(`[DEBUG] Attempting to remove .f3-history-controls #${idx} (hidden)`);
            try {
              ctrl.remove();
              console.log(`[DEBUG] Actually removed .f3-history-controls #${idx}`);
            } catch (e) {
              console.error(`[DEBUG] Failed to remove .f3-history-controls #${idx}:`, e);
            }
          }
        });
      });
      observer.observe(navCont, { childList: true, subtree: false });
    }

    // Clean up: remove the button and disconnect observer on unmount or f3Chart change
    return () => {
      const historyControl = document.querySelector(".f3-history-controls");
      if (historyControl) {
        const existing = historyControl.querySelector(".f3-save-button");
        if (existing) existing.remove();
      }
      if (observer) observer.disconnect();
    };
  }, [f3Chart]);
  return null;
}
