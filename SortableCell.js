import React, {
    Component,
} from 'react'
import PropTypes from 'prop-types';
import {
    View, Text,
    StyleSheet,
    PanResponder,
    Animated,
} from 'react-native'
import {
    cellScale,
    cellAnimationTypes,
    cellTranslation,
} from './constants'

export default class SortableCell extends Component {

    static propTypes = {
        columnCount: PropTypes.number.isRequired,
        columnWidth: PropTypes.number.isRequired,
        rowHeight: PropTypes.number.isRequired,
        coordinate: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }).isRequired,
        renderCell: PropTypes.func.isRequired,
        data: PropTypes.object.isRequired,
        index: PropTypes.number.isRequired,
        dataList: PropTypes.array.isRequired,
        sortable: PropTypes.bool.isRequired,
    }

    constructor (props) {
        super(props)
        let {x, y,} = props.coordinate
        //console.log(`constructor -> data.title = ${props.data.title}, index = ${props.index}, x=${props.coordinate.x}, y=${props.coordinate.y}`)
        this.state = {
            //x: new Animated.Value(x),
            //y: new Animated.Value(y),
            coordinate: new Animated.ValueXY({
                x,
                y,
            }),
            scale: new Animated.Value(1),
            zIndex: 0,
            visible: true,
        }
        this._scaleAnimationInstace = null
        this._translationAnimationInstace = null
    }

    render () {
        let {columnWidth, rowHeight, data, index, dataList, } = this.props
        let {x, y,} = this.state.coordinate
        //console.log(`cell rerender data.title = ${data.title}, index = ${index}, x = ${x._value}, y = ${y._value},`)
        //console.log(data)
        //console.log(dataList)
        return (
            this.state.visible ?
                <Animated.View
                    style={{width: columnWidth, height: rowHeight, position: 'absolute', zIndex: this.state.zIndex, left: x, top: y, transform: [ { scale: this.state.scale, }, ], }}
                    key={`sortable-cell-${(data.key != null) ? data.key : index}`}>
                    {this.props.renderCell(data, this)}
                </Animated.View> : null
        )
    }

    componentWillUnmount () {
        this._stopScaleAnmation()
    }

    setCoordinate = (coordinate) => {
        let {x, y,} = coordinate
        this.setState({
            coordinate: new Animated.ValueXY({
                x,
                y,
            })
        })
    }

    setZIndex = (zIndex) => {
        this.setState({
            zIndex,
        })
    }

    startScaleAnimation = ({ scaleValue, callback, }) => {
        //if (this._scaleAnimationInstace) {
        //    return
        //}
        this._scaleAnimationInstace = Animated.timing(
            this.state.scale,
            {
                toValue: scaleValue,
                duration: cellScale.animationDuration,
            }
        ).start(() => {
            this._scaleAnimationInstace = null
            if(scaleValue == 0) {
                this.setState({
                    visible: false,
                })
            }
            callback && callback()
        })
    }

    getTranslationAnimation = ({ animationType, coordinate, }) => {
        let { columnWidth, rowHeight, columnCount, } = this.props
        let { backToOrigin, rightTranslation, leftTranslation, leftBottomTranslation, rightTopTranslation, } = cellAnimationTypes
        let x = this.state.coordinate.x._value
        let y = this.state.coordinate.y._value
        let { x: originX, y: originY, } = coordinate
        //console.log(`startTranslationAnimation -> x=${x}, y=${y}, originX = ${originX}, originY = ${originY}`)
        switch (animationType) {
            case backToOrigin:
                x = originX
                y = originY
                break;
            case leftTranslation:
                //x = x - columnWidth
                x = x - (columnWidth - (originX - x))
                break;
            case rightTranslation:
                x = x + (columnWidth - (x - originX))
                break;
            case leftBottomTranslation:
                x = x - ((columnCount - 1) * columnWidth - (originX - x))
                y = y + (rowHeight - (y - originY))
                break;
            case rightTopTranslation:
                x = x + ((columnCount - 1) * columnWidth - (x - originX))
                y = y - (rowHeight - (originY - y))
                break;
        }
        //console.log(`translation x = ${x}, y = ${y}, `)
        return Animated.timing(
            this.state.coordinate,
            {
                toValue: {
                    x,
                    y,
                },
                duration: cellTranslation.animationDuration,
            }
        )
    }

    startTranslationAnimation = ({ animationType, coordinate, callback, }) => {
        //if (this._translationAnimationInstace) {
            this.stopTranslationAnimation()
        //}
        this._translationAnimationInstace = this.getTranslationAnimation({ animationType, coordinate,})
        this._translationAnimationInstace.start(() => {
            callback && callback()
            this._translationAnimationInstace = null
        })
    }

    stopTranslationAnimation = () => {
        //if (!this._translationAnimationInstace) {
        //    return
        //}
        this._translationAnimationInstace && this._translationAnimationInstace.stop()
        this._translationAnimationInstace = null
    }

    _stopScaleAnmation = () => {
        //if (!this._scaleAnimationInstace) {
        //    return
        //}
        this._scaleAnimationInstace && this._scaleAnimationInstace.stop()
        this._scaleAnimationInstace = null
    }

}
