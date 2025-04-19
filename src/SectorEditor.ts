import { ButtonObserver, Button } from "./Button";
import { NodeButtonObserver, OWNode } from "./Node";
import { Sector } from "./Sector";
import { Vector2 } from "./Vector2";

export class SectorEditor implements NodeButtonObserver, ButtonObserver
{
  _activeSector: Sector;
  _saveButton: Button;
  
  _selection: OWNode;
  _dragging: boolean = false;
  
  constructor(sector: Sector)
  {
    this._activeSector = sector;
    this._saveButton = new Button("保存", width - 75, height - 50, 100, 50);
    this._saveButton.setObserver(this);
  }
  
  update(): void
  {
    this._saveButton.update();
    
    if (this._selection != null)
    {
      if (this._dragging)
      {
        this._selection.setScreenPosition(new Vector2(mouseX, mouseY));
        
        if (!mouseIsPressed)
        {
          this._selection.savePosition();
          this._selection = null;
          this._dragging = false;
        }
      }
      
      this._dragging = (mouseIsPressed && mouseButton == CENTER);
    }
  }
  
  render(): void
  {
    this._saveButton.render();
  }
  
  onButtonUp(button: Button): void
  {
    if (button == this._saveButton)
    {
      this._activeSector.saveSectorJSON();
    }
  }
  
  onNodeGainFocus(node: OWNode): void
  {
    this._selection = node;
  }
  
  onNodeLoseFocus(node: OWNode): void
  {
    if (!this._dragging)
    {
      this._selection = null;
    }
  }

  onTravelToNode(node: OWNode): void{}
  onExploreNode(node: OWNode): void{}
  onProbeNode(node: OWNode): void{}
  
  onButtonEnterHover(button: Button): void{}
  onButtonExitHover(button: Button): void{}
  onNodeSelected(node: OWNode): void{}
}