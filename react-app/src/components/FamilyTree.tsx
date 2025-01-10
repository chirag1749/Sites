import { useEffect, useRef, MouseEvent } from "react";
import f3 from 'family-chart';
import "family-chart/styles/family-chart.css";
import "./FamilyTree.css";
import { Person, Identity} from "./Person";

function FamilyTree()
{
  const divFamilyChart = useRef(null);

  useEffect(() => {
    if (!divFamilyChart.current) return; 
      create(divFamilyChart.current, data());
  });

  function create(divElement: HTMLDivElement, data: Person[] ) 
  {
    const f3Chart = f3.createChart(divElement, data)
      .setTransitionTime(1000)
      .setCardXSpacing(250)
      .setCardYSpacing(150)
      .setOrientationVertical()
      .setSingleParentEmptyCard(true, {label: '(unknown)'});
  
    const f3Card = f3Chart.setCard(f3.CardHtml)
      .setCardDisplay([["firstName","lastName"],["birthday"]])
      .setCardDim({})
      .setMiniTree(true)
      .setStyle('imageRect')
      .setOnHoverPathToMain()
      .setOnCardClick(OnCardClick);

    const f3EditTree = f3Chart.editTree()
      .fixed(true)
      .setFields(["firstName","lastName","birthday","avatar"])
      .setEditFirst(false)
      .setEdit();

    function OnCardClick(event: MouseEvent, node: Node)
    {
      f3EditTree.open(node);
      if (f3EditTree.isAddingRelative()) return;
      f3Card.onCardClickDefault(event, node);

      let person5 = new Person("5", new Identity("Sp", "SP", "M"));
      person4.AddFather(person1);
      person4.AddMother(person2);
      person4.AddSpouce(person5)

      f3Chart.store.state.data.push(person4);
      f3Chart.store.state.data.push(person5);
      f3Chart.updateTree();
    }
      
    f3Chart.updateTree({initial: true});
  }

  let person1 = new Person("0", new Identity("FName", "LName", "M"));
  let person2 = new Person("1", new Identity("F1Name", "L1Name", "F"));
  let person3 = new Person("2", new Identity("F2Name", "L2Name", "F"));
  let person4 = new Person("3", new Identity("F3Name", "L3Name", "F"));
  
  function data() {
    person1.AddSpouces([person2, person3]);

    return [
      person1,
      person2,
      person3
    ];
  }

  return <div className="family-tree-override f3 f3-cont" id="FamilyChart" ref={divFamilyChart}/>;
};

export default FamilyTree;