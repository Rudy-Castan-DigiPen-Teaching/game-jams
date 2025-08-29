function mergeTiles(level, tileSize, tileType)
{
    let w           = level.width;
    let h           = level.height;
    let tiles       = level.tiles;
    let mergedRects = [];
    let visited     = new Array(w * h).fill(false);

    for (let y = 0; y < h; y++)
    {
        for (let x = 0; x < w; x++)
        {
            let index = y * w + x;
            if (visited[index] || tiles[index] !== tileType)
            {
                continue;
            }

            let rectX = x, rectY = y;
            let rectWidth = 1, rectHeight = 1;

            // Expand width
            while (x + rectWidth < w && tiles[y * w + (x + rectWidth)] === tileType && !visited[y * w + (x + rectWidth)])
            {
                rectWidth++;
            }

            // Expand height
            let expandHeight = true;
            while (expandHeight && y + rectHeight < h)
            {
                for (let i = 0; i < rectWidth; i++)
                {
                    if (tiles[(y + rectHeight) * w + (x + i)] !== tileType || visited[(y + rectHeight) * w + (x + i)])
                    {
                        expandHeight = false;
                        break;
                    }
                }
                if (expandHeight)
                    rectHeight++;
            }

            // Mark tiles as visited
            for (let dy = 0; dy < rectHeight; dy++)
            {
                for (let dx = 0; dx < rectWidth; dx++)
                {
                    visited[(y + dy) * w + (x + dx)] = true;
                }
            }

            // Store merged rectangle
            mergedRects.push(new RectangleTile(rectX * tileSize, rectY * tileSize, rectWidth * tileSize, rectHeight * tileSize, tileType));
        }
    }

    return mergedRects;
}

function collectTiles(level, tileSize, tileTypes)
{
    const w          = level.width;
    const h          = level.height;
    const tiles      = level.tiles;
    const collection = [];
    for (let y = 0; y < h; y++)
    {
        for (let x = 0; x < w; x++)
        {
            const index = y * w + x;
            if (!tileTypes.includes(tiles[index]))
                continue;
            collection.push(new RectangleTile(x * tileSize, y * tileSize, tileSize, tileSize, tiles[index]));
        }
    }
    return collection;
}
