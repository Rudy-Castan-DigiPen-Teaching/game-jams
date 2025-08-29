class Rectangle
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw() { rect(this.x, this.y, this.w, this.h); }
}

class RectangleTile
{
    constructor(x, y, w, h, tile = EMPTY)
    {
        this.x    = x;
        this.y    = y;
        this.w    = w;
        this.h    = h;
        this.tile = tile;
    }

    draw()
    {
        drawTileInDetail(this.tile, this.x, this.y, this.w, this.h);
    }
}

function rectCollision(r1, r2)
{
    if (r1.x < r2.x + r2.w && r1.x + r1.w > r2.x && r1.y < r2.y + r2.h && r1.h + r1.y > r2.y)
    {
        return true;
    }
    else
    {
        // No collision
        return false;
    }
}

// Rectangle vs Triangle collision detection
// Triangles are right triangles formed by cutting a square diagonally
// triangleType: LEFT_RAMP (bottom-left to top-right) or RIGHT_RAMP (top-left to bottom-right)
function rectTriangleCollision(rect, triangleX, triangleY, triangleW, triangleH, triangleType)
{
    // First do a quick AABB check - if rectangle doesn't overlap triangle's bounding box, no collision
    if (!rectCollision(rect, {x : triangleX, y : triangleY, w : triangleW, h : triangleH}))
    {
        return false;
    }

    // Get rectangle corners
    let rectLeft   = rect.x;
    let rectRight  = rect.x + rect.w;
    let rectTop    = rect.y;
    let rectBottom = rect.y + rect.h;

    // Get triangle corners based on type
    let tri1x, tri1y, tri2x, tri2y, tri3x, tri3y;

    if (triangleType === LEFT_RAMP)
    {
        // Triangle from bottom-left to top-right diagonal
        // Corners: bottom-left, bottom-right, top-right
        tri1x = triangleX;
        tri1y = triangleY + triangleH; // bottom-left
        tri2x = triangleX + triangleW;
        tri2y = triangleY + triangleH; // bottom-right
        tri3x = triangleX + triangleW;
        tri3y = triangleY; // top-right
    }
    else // RIGHT_RAMP
    {
        // Triangle from top-left to bottom-right diagonal
        // Corners: top-left, bottom-left, bottom-right
        tri1x = triangleX;
        tri1y = triangleY; // top-left
        tri2x = triangleX;
        tri2y = triangleY + triangleH; // bottom-left
        tri3x = triangleX + triangleW;
        tri3y = triangleY + triangleH; // bottom-right
    }

    // Check if any rectangle corner is inside the triangle
    let corners = [ {x : rectLeft, y : rectTop}, {x : rectRight, y : rectTop}, {x : rectLeft, y : rectBottom}, {x : rectRight, y : rectBottom} ];

    for (let corner of corners)
    {
        if (pointInTriangle(corner.x, corner.y, tri1x, tri1y, tri2x, tri2y, tri3x, tri3y))
        {
            return true;
        }
    }

    // Check if any triangle corner is inside the rectangle
    let triCorners = [ {x : tri1x, y : tri1y}, {x : tri2x, y : tri2y}, {x : tri3x, y : tri3y} ];

    for (let corner of triCorners)
    {
        if (corner.x >= rectLeft && corner.x <= rectRight && corner.y >= rectTop && corner.y <= rectBottom)
        {
            return true;
        }
    }

    return false;
}

// Helper function: Check if point is inside triangle using barycentric coordinates
function pointInTriangle(px, py, x1, y1, x2, y2, x3, y3)
{
    let denom = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    let a     = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denom;
    let b     = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denom;
    let c     = 1 - a - b;

    return a >= 0 && b >= 0 && c >= 0;
}
