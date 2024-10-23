const rows = 9;  
        const selectedAttr = "selected";
        const gameField = [];

        const gameFieldPlaceholder = window.document.getElementById("gameField");
        for (let r = 0; r < rows; ++r){
            const rowNode = document.createElement("div");
            rowNode.classList.add("row");
            rowNode.id = `row${r}`;
            gameFieldPlaceholder.appendChild(rowNode);
            

            for (let c = 0; c < rows; ++c){
                const cellNode = document.createElement("div");
                cellNode.classList.add("cell");
                cellNode.id = `cell${r}-${c}`;
                cellNode.classList.add("cell");
                cellNode.appendChild(document.createElement("div"));

                rowNode.appendChild(cellNode);

                const cell = {
                    node : cellNode,
                    color : null,
                    selected : false,
                    col : c,
                    row : r
                };
                gameField[r * rows + c] = cell;

                cellNode.addEventListener("click", (e) => onClickCell(cell));                
                cellNode.addEventListener("contextmenu", (e) => onRightClickCell(cell, e));                
            }
        }
        
        function onClickCell(cell) {
            if (cell.node.classList.contains("circle"))
                selectCell(cell);
            else{
                moveSelectedTo(cell);
                //addCircle(cell, 2);
            }
                
        }
        function onRightClickCell(cell, e) {
            if (!cell.node.classList.contains("circle"))
                addCircle(cell, 2);
            
            e.preventDefault();
        }
        
        function moveSelectedTo(cell){
            const sel = gameField.find(c => c.node.classList.contains(selectedAttr));
            if (!sel)
                return;

            const path = getPath(sel, cell);
            console.log(path);

            sel.node.classList.remove("selected");
            sel.node.classList.remove("circle");   
         
            showPath(0, path, () => {
                cell.node.classList.add("color2");
                cell.node.classList.add("circle");
            });
    
        }

        function showPath(current, path, lastStep) {

            if (current == path.length)
            {
                path.forEach(p => {
                    gameField[p.r * rows + p.c].node.classList.remove("path");
                    gameField[p.r * rows + p.c].node.classList.remove("color2");
                }   );  
                lastStep();
                console.log("last timer", current);             
            }
            else {            
                gameField[path[current].r * rows + path[current].c].node.classList.add("path");
                gameField[path[current].r * rows + path[current].c].node.classList.add("color2");
                setTimeout(() => showPath(current+1, path, lastStep), 50);
                console.log("next timer", current);
            }
            
        }

        function* getNeighbors(arr, r, c) {            
            if (arr[r-1] !== undefined)
                yield {r: r-1, c};
            if (arr[r+1] !== undefined)
                yield {r : r+1, c};
            if (arr[r][c-1] !== undefined)
                yield {r, c: c-1};
            if (arr[r][c+1] !== undefined)
                yield {r, c: c+1};
        }

        function getPos(node) {
            const reg = /cell(?<r>\d+)\-(?<c>\d+)/;
            const res = reg.exec(node.id);
            return {r:parseInt(res.groups.r), c:parseInt(res.groups.c)};
        }

        function getPath(source, target)
        {
            function initLength(r, c) {
                const cell = gameField[r* rows + c];
                if (cell == source)
                    return 0;
                if (cell.node.classList.contains("circle"))
                    return null;
                return Infinity;
            }

            const arrfield = Array.from(
                { length: rows }, (_, r) => Array.from(
                    {length: rows}, (_, c) => initLength(r, c)));

            let found = Infinity;
            while (found) {
                found = 0;
                for (let r = 0; r < rows; ++r)
                {
                    for (let c = 0; c < rows; ++c)
                    {
                        const curLen = arrfield[r][c];
                        if (curLen === null) // occuped
                            continue;

                        const neibors = getNeighbors(arrfield, r, c);

                        const lengths = neibors
                            .map(n => arrfield[n.r][n.c])
                            .filter(l => l !== null)
                            .toArray();                      
                        
                        if (lengths.length == 0)
                            continue;

                        const minLen = Math.min(...lengths) + 1;
                        if (minLen < curLen){
                            arrfield[r][c] = minLen;
                            found++;
                        }
                    }
                }
                console.log(`finding path, make ${found} changes`);                
            }

            console.log(arrfield);

            const targetPos = getPos(target.node);

            const trace = tracePath(arrfield, targetPos);
            console.log(trace);
            return trace;
        }

        function tracePath(field, targetPos) {
            
            let curPos = targetPos;
            let curLen = field[curPos.r][curPos.c];
            if (curLen === Infinity)
                return [];

            const neibors = getNeighbors(field, curPos.r, curPos.c).toArray();
            
            for (let n of neibors){
                const len = field[n.r][n.c];
                if (len == null)
                continue;
                if (len < curLen) {
                    curPos = n;
                    curLen = len;
                }
                    
            }
            
            console.log("path:", curPos);
            if (curLen === 0)
                return [curPos];

            var next = tracePath(field, curPos);
            return [...next, curPos];
        }

        function addCircle(cell, color) {           
            cell.node.classList.add("circle");
            cell.node.classList.add("color"+color);
        }

        function selectCell(cell) {           
            gameField.filter(c => c !== cell).forEach(c => {
                c.selected = false;
                c.node.classList.remove(selectedAttr);
            })
            cell.node.classList.add(selectedAttr);
        }