import {
    dragDirection,
    cellAnimationTypes,
} from './constants'

function isPointInPath ({ touchCoordinate, cellCoordinate, cellWidth, cellHeight, }) {
    let { x, y, } = cellCoordinate
    let { x: coordinateX, y: coordinateY } = touchCoordinate
    ////console.log(`isPointInPath x = ${x}, y = ${y}, coordinateX = ${coordinateX}, coordinateY = ${coordinateY}, cellWidth = ${cellWidth}, cellHeight= ${cellHeight},`)
    if (!(coordinateX < x || coordinateX > x + cellWidth)
        && !(coordinateY < y || coordinateY > y + cellHeight)) {
        return true
    }
    return false
}

function getCellsAnimationOptions ({ currentCellIndex, hoverCellIndex, columnCount, cells }) {
    let cellsAnimation = []
    let { up, right, down, left, } = dragDirection
    let { rightTranslation, leftTranslation, leftBottomTranslation, rightTopTranslation, } = cellAnimationTypes
    let currentRowNumber = getRowNumber({
        cellIndex: currentCellIndex,
        columnCount,
    })
    let hoverRowNumber = getRowNumber({
        cellIndex: hoverCellIndex,
        columnCount,
    })
    //console.log(`getCellsAnimationOptions currentCellIndex = ${currentCellIndex}, hoverCellIndex = ${hoverCellIndex}, currentRowNumber = ${currentRowNumber},hoverRowNumber = ${hoverRowNumber} columnCount = ${columnCount},`)
    let currentDirection = getDragDirection({
        currentRowNumber,
        hoverRowNumber,
        currentCellIndex,
        hoverCellIndex,
    })
    //console.log(`getCellsAnimationOptions currentDirection = ${currentDirection}`)
    let len = Math.abs(currentCellIndex - hoverCellIndex)
    for (let i = 0; i < len; i++) {
        let cellIndex, animationType
        switch (currentDirection) {
            case up:    //currentCellIndex > hoverCellIndex
                cellIndex = hoverCellIndex + i
                if (isLastCellOfRow({ cellIndex, columnCount, })) {
                    animationType = leftBottomTranslation
                }
                else {
                    animationType = rightTranslation
                }
                break
            case right: //currentCellIndex > hoverCellIndex
                //cellIndex = hoverCellIndex
                cellIndex = hoverCellIndex - i //for supporting remove cell logic
                animationType = leftTranslation
                break
            case down:  //currentCellIndex < hoverCellIndex
                cellIndex = currentCellIndex + 1 + i
                if (isFirstCellOfRow({ cellIndex, columnCount, })) {
                    animationType = rightTopTranslation
                }
                else {
                    animationType = leftTranslation
                }
                break
            case left:  //currentCellIndex < hoverCellIndex
                cellIndex = hoverCellIndex
                animationType = rightTranslation
                break
        }
        //console.log(`cellIndex = ${cellIndex} length = ${cells.length}`)
        //console.log(`cells[ cellIndex ] = `)
        //console.log(cells[ cellIndex ])
        let cellComponent = cells[ cellIndex ].component
        cellsAnimation.push({
            cellIndex,
            cellComponent,
            animationType,
        })
    }
    return cellsAnimation
}

function getDragDirection ({ currentRowNumber, hoverRowNumber, currentCellIndex, hoverCellIndex, }) {
    let { up, right, down, left, none } = dragDirection
    if (currentRowNumber < hoverRowNumber) {
        return down
    }
    else if (currentRowNumber > hoverRowNumber) {
        return up
    }
    else {
        if (currentCellIndex > hoverCellIndex) {
            return left
        }
        else if (currentCellIndex < hoverCellIndex) {
            return right
        }
        else {
            return none
        }
    }
}

function getRowNumber ({ cellIndex, columnCount, }) {
    return Math.floor(cellIndex / columnCount)
}

function isFirstCellOfRow ({ cellIndex, columnCount, }) {
    return cellIndex % columnCount == 0
}

function isLastCellOfRow ({ cellIndex, columnCount, }) {
    return (cellIndex + 1) % columnCount == 0
}

export default {
    isPointInPath,
    getDragDirection,
    getCellsAnimationOptions,
    getRowNumber,
}