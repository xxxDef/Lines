

class Logic
{
    static generateColor() {
        return Math.floor(Math.random() * LinesGame.Colors);
    }

    static getNextRnd(max) {
        return Math.floor(Math.random() * max);
    }

    static * generateLines(rows, minLine) {
        // horisontal
        for (let row = 0; row < rows; ++row)  {
            for (let col = 0; col < rows; ++col)
                yield {row, col};
            yield null;
        }
        
        // vertical
        for (let col = 0; col < rows; ++col)  {
            for (let row = 0; row < rows; ++row)
                yield {row, col};
            yield null;
        }

        // Enumerate primary diagonals (from top-left to bottom-right)
        for (let diff = -(rows - 1); diff <= rows - 1; diff++) {
            for (let row = 0; row < rows; row++) {
                let col = row - diff;
                if (col >= 0 && col < rows) 
                    yield {row, col};
                
            }
            yield null;
        }
        for (let sum = 0; sum <= 2 * (rows - 1); sum++) {
            //console.log(`Secondary diagonal with row + col = ${sum}`);
            for (let row = 0; row < rows; row++) {
                let col = sum - row;
                if (col >= 0 && col < rows) {
                    yield {row, col};
                }
            }
        }

    }
    static findItemsToRemove(gameField, minLine = 5){
        const result = [];

        function addToResult(line) {
            if (line.length >= minLine)
                result.push(...line);
        }

        let color = null;
        let line = [];
        for (let pos of this.generateLines(gameField.Rows, minLine))
        {
            if (pos === null)  // breaker
            {
                addToResult(line);
                line = [];
                color = null;
                continue;
            }

            const cell = gameField.getCell(pos.row, pos.col);
            
            if (cell.color === null)
            {
                addToResult(line);
                line = [];
                color = null;
                continue;
            }
            
            if (color != cell.color) {
                addToResult(line);
                line = [cell];
                color = cell.color;
                continue;
            }
            
            if (color !== null) {
                line.push(cell);
            }
        }
        addToResult(line);

        return result;
    }
    static getPath(gameField, source, target)
    {
        function initDistance(r, c) {
            const cell = gameField.getCell(r,c);
            if (cell == source)
                return 0;  // source
            if (cell.color !== null)
                return null; // occuped
            return Infinity; // possible target
        }

        const field = Array.from(
            { length: gameField.Rows }, (_, r) => Array.from(
                {length: gameField.Rows }, (_, c) => initDistance(r, c)));

        while (this.#fillDistances(field));

        //console.log(field);

        const trace = this.tracePath(field,  target);
        //console.log(trace);
        return trace;
    }

    static tracePath(field, curPos) {
               
        let curLen = field[curPos.row][curPos.col];
        if (curLen === Infinity)
            return [];

        function findMin(res, pos) {
            const curLen = field[pos.row][pos.col];
            if (curLen === null)
                return res;
            if (res === null)
                return pos;
            const resLen = field[res.row][res.col]
  
            if (curLen < resLen)
                return pos;
            return res;
        }

        const nextPos= this.#getNeighbors(field, curPos.row, curPos.col).reduce(findMin, null);    

        const nextLen = field[nextPos.row][nextPos.col];
        if (nextLen === 0)
            return [nextPos];

        var next = this.tracePath(field, nextPos);
        return [...next, nextPos];
    }

    static * #getNeighbors(field, row, col) {            
        if (field[row-1] !== undefined)
            yield {row: row-1, col};
        if (field[row+1] !== undefined)
            yield {row:row+1, col};
        if (field[row][col-1] !== undefined)
            yield {row, col:col-1};
        if (field[row][col+1] !== undefined)
            yield {row, col:col+1};
    }

    static #fillDistances(field) {
        let found = 0;
        for (let row = 0; row < field.length; ++row)
        {
            for (let col = 0; col < field[row].length; ++col)
            {
                const curLen = field[row][col];
                if (curLen === null) // occuped
                    continue;

                const neibors = this.#getNeighbors(field, row, col);

                const lengths = neibors
                    .map(n => field[n.row][n.col])
                    .filter(l => l !== null)
                    .toArray();                      
                
                if (lengths.length == 0)
                    continue;

                const minLen = Math.min(...lengths) + 1;
                if (minLen < curLen){
                    field[row][col] = minLen;
                    found++;
                }
            }
        }
        //console.log(field);
        return found;
    }
}

class GameCell {
    row;
    col;
    node;
    circle;
    
    #selected;
    #color;

    constructor(parentDiv, r, c){
        const cellNode = document.createElement("div");
        cellNode.classList.add("cell");
        cellNode.id = `cell${r}-${c}`;

        const circle = document.createElement("div");
        circle.id = `circle${r}-${c}`;
        cellNode.appendChild(circle);

        parentDiv.appendChild(cellNode);

        this.col = c;
        this.row = r;
        this.node = cellNode;
        this.circle = circle;
        this.#selected = false;
        this.#color = null;          
    }

    get color() {
        return this.#color;
    }

    get selected() {
        return this.#selected;
    }

    select() {
        this.circle.classList.add("selected");      
        this.#selected = true;
    }

    deselect() {
        this.circle.classList.remove("selected");       
        this.#selected = false;   
    }

    setColor(color) {
   
        if (color === null){
            if (this.#color === null)
                throw `clear color in empty cell`;
            this.circle.classList.remove("color" + this.#color);
            this.circle.classList.remove("circle");
            this.#color = null;
        }
        else {
            if (this.#color !== null)
                throw `set color ${color} but already set color ${this.#color}`;
            this.#color = color;
            this.circle.classList.add("color" + this.#color);
            this.circle.classList.add("circle");
        }
    }

    hidePath(color) {
        this.circle.classList.remove("path");
        this.circle.classList.remove("color"+ color);
    }
    
    showPath(color) {
        this.circle.classList.add("path");
        this.circle.classList.add("color" + color);
    }
    
    showRemoving() {
        this.circle.classList.add("removing");
    }
    hideRemoving() {
        this.circle.classList.remove("removing");
    }

    set onClick(handler) {
        this.node.addEventListener("click", () => handler(this)); 
    };    

    set onRightClick(handler) {
        this.node.addEventListener("contextmenu", (e) => {
            handler(this);
            e.preventDefault();
        }); 
    };
    
}

class NextCircle{

    #color;
    #node;

    constructor(node) {
        this.#node = node;
        this.setRandomColor();
    }

    setRandomColor() {
        if (this.#color !== null) {
            this.#node.classList.remove(`color${this.#color}`);
        }
        this.#color = Logic.generateColor();
        this.#node.classList.add(`color${this.#color}`);
    }

    get color() {
        return this.#color;
    }
}
class LinesGame
{
    static rows = 9;  
    static selectedAttr = "selected";

    get Rows() {
        return 9;
    }
    static get Colors() {
        return 5;
    }
    
    #gameField = [];
    #animationInProgress = false;
    #nextCircles = [];

    #score = 0;
    #high = 0;

    constructor() {
        const gameFieldDiv = document.getElementById("gameField");
        for (let r = 0; r < this.Rows; ++r){
            const rowNode = document.createElement("div");
            rowNode.classList.add("row");
            rowNode.id = `row${r}`;
            gameFieldDiv.appendChild(rowNode);
            
            for (let c = 0; c < this.Rows; ++c){

                const cell = new GameCell(rowNode, r, c);
                cell.onClick = this.#onClickCell;
                cell.onRightClick = this.#onRightClickCell;
                
                this.#gameField[r * this.Rows + c] = cell;      
            }
        }
       
        for (let i = 0; i < 3; ++i){
            const node = document.getElementById(`nextCircle${i}`);
            this.#nextCircles[i] = new NextCircle(node);
        }
        this.highlightScore();
        this.highlightHigh();
        this.nextTurn();
    }

    nextTurn() {
        if (this.#removeLines())
            return;

        let endGame = false 
        for (let nextCircle of this.#nextCircles){

            const newPlace = this.#getEmptyPlace();
            if (newPlace == null && !this.#removeLines())
                break;           

            newPlace.setColor(nextCircle.color);
            nextCircle.setRandomColor();
        }

        if (!this.#removeLines() && this.#getEmptyPlace() == null)
            this.endGame();
    }

    endGame() {
        if (this.#score > this.#high)
        {
            this.#high = this.#score;
            this.highlightHigh();
        }
    }

    highlightHigh() {
        const div = document.getElementById("high");
        div.textContent  = this.#high;
    }
    highlightScore() {
        const div = document.getElementById("score");
        div.textContent  = this.#score;
    }
    increaseScore(removedCount) {
        if (removedCount < 5)
            throw "unexpected removed count";
        this.#score += 5; // first 5 balls 
        if (removedCount > 5)
            this.#score += (removedCount - 5) * 2; // x2 bonus for next
        this.highlightScore();
    }

    getCell = (r, c) => this.#gameField[r* this.Rows + c];

    #getEmptyPlace() {
        const emptyCount = this.#gameField.reduce(
            (total, cell) => (cell.color === null ? total+1 : total), 0);

        console.log("empty cells:", emptyCount);    

        if (emptyCount === 0) 
            return null;

        const cnt = Logic.getNextRnd(emptyCount);
        let pos = 0;
        for (let cell of this.#gameField) {
            if (cell.color !== null)
                continue;
            if (pos === cnt) {
                if (cell.color !== null)
                    throw "wrong alghoritm";
                return cell;
            }
            ++pos;
        }
        throw "unexpected end of field";
    }

    #onClickCell = (cell) => {
        if (cell.color !== null)
            this.selectCell(cell);
        else{
            if (!this.#animationInProgress)
                this.#moveSelectedTo(cell);
        }
            
    }
    #onRightClickCell = (cell) => {
        if (cell.color === null) {
            const color = Logic.generateColor();
            cell.setColor(color);
        }         
    }

    
    
    
    #moveSelectedTo(cell) {
        const sel = this.#gameField.find(c => c.selected);
        if (!sel)
            return;

        const path = Logic.getPath(this, sel, cell);
        if (path.length === 0)
            return;
        //console.log(path);

        sel.deselect();  
        const color = sel.color;
     
        sel.setColor(null);
        this.#showPath(0, path, color, () => {
            cell.setColor(color);
            this.nextTurn();
            
        });            
    }

    #removeLines() {
        const itemsToRemove = Logic.findItemsToRemove(this);

        if (itemsToRemove.length == 0)
            return false;
        
        this.increaseScore(itemsToRemove.length);

        this.#removingLines(itemsToRemove);  
        return true;        
    }

    #removingLines(itemsToRemove) {
        this.#animationInProgress = true;
        for (let cell of itemsToRemove)
            cell.showRemoving();
        
        setTimeout(() => {
            for (let cell of itemsToRemove) {                
                cell.hideRemoving();
                cell.setColor(null);

            }
            this.#animationInProgress = false;
        }, 300); 
    }

    #showPath(current, path, color, lastStep) {

        if (current == path.length)
        {
            path.forEach(p => this.getCell(p.row, p.col).hidePath(color));  
            lastStep();  
            this.#animationInProgress = false;           
        }
        else {            
            this.#animationInProgress = true;
            const cell = this.getCell(path[current].row, path[current].col);
            cell.showPath(color);
            setTimeout(() => this.#showPath(current+1, path, color, lastStep), 30);
            
        }
        
    }

    selectCell(cell) {           
        this.#gameField.filter(c => c !== cell).forEach(c => c.deselect());
        cell.select();        
    }
}

