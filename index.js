import React from "react";
import * as LinkPreview from "react-native-link-preview";
import PropTypes from 'prop-types';
import {Image, Linking, Platform, Text, TouchableOpacity, View, ViewPropTypes} from "react-native";

const REGEX = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;

export default class RNUrlPreview extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            isUri: false,
            linkTitle: undefined,
            linkDesc: undefined,
            linkFavicon:undefined,
            linkImg: undefined
        };
        this.getPreview(props.defaultData, props.text, props.onLinkLoaded, props.onLinkFailed)
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;   
    }

    updateState(newState) {
        if (this._isMounted) {
            this.setState(newState);
        }
    }

    getPreview = (defaultData, text, onLinkLoaded, onLinkFailed) =>{
        let url = text && text.match(REGEX) && text.match(REGEX)[0]
        if(url){
            LinkPreview.getPreview(url)
                .then(data => {
                    onLinkLoaded(data);
                    this.updateState({
                        isUri: true,
                        linkTitle: data.title ? data.title : undefined,
                        linkDesc: data.description ? data.description : undefined,
                        linkImg: data.images && data.images.length > 0 ?
                            data.images.find(function (element) {
                                return (element.includes('.png') || element.includes('.jpg') || element.includes('.jpeg'))
                            }) :  undefined ,
                        linkFavicon: data.favicons && data.favicons.length > 0 ? data.favicons[data.favicons.length - 1] : undefined
                    })
                }).catch(error => {
                    onLinkFailed(error);
                    if(defaultData) {
                        this.updateState({
                            isUri: true,
                            linkTitle: defaultData.title ? defaultData.title : undefined,
                            linkDesc: defaultData.description ? defaultData.description : undefined,
                            linkImg: defaultData.images && defaultData.images.length > 0 ?
                                defaultData.images.find(function (element) {
                                    return (element.includes('.png') || element.includes('.jpg') || element.includes('.jpeg'))
                                }) :  undefined,
                        });
                    }
                });
        }else {
            this.updateState({isUri: false})
        }

    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.text !== null ){
            this.getPreview(nextProps.defaultData, nextProps.text, nextProps.onRssFeedLoaded, nextProps.onRssFeedFailed)
        }else{
            this.updateState({isUri: false})
        }
    }

    _onLinkPressed = () => {
        Linking.openURL(
            this.props.text.match(REGEX)[0]
        );
    }

    renderImage = (imageLink,faviconLink,imageStyle,faviconStyle)=> {
        return(
                imageLink ?
                    <Image
                        style={imageStyle}
                        source={{uri: imageLink}}
                        resizeMode={'contain'}
                    /> : faviconLink ?
                    <Image
                        style={faviconStyle}
                        source={{uri: faviconLink}}
                        resizeMode={'contain'}
                    /> : null
        )
    }
    renderText = (showTitle,title,description,textContainerStyle,titleStyle,descriptionStyle,titleNumberOfLines,descriptionNumberOfLines)=> {
        return(
            <View style={textContainerStyle}>
                {
                    showTitle && <Text
                    numberOfLines={titleNumberOfLines}
                    style={titleStyle}
                        >{title}</Text>
                }
                {
                    description && <Text
                    numberOfLines={descriptionNumberOfLines}
                    style={descriptionStyle}
                        >{description}</Text>
                }
            </View>
        )
    }
    renderLinkPreview = (text, onPress, containerStyle,
                         imageLink,faviconLink,imageStyle,faviconStyle,
                         showTitle,title,description,textContainerStyle,titleStyle,descriptionStyle,titleNumberOfLines,descriptionNumberOfLines)=> {
        return(
            <TouchableOpacity
                style={[styles.containerStyle,containerStyle]}
                activeOpacity={0.9}
                onPress={()=> {
                    onPress();
                    this._onLinkPressed();
                }}
            >
                {this.renderText(showTitle,title,description,textContainerStyle,titleStyle,descriptionStyle,titleNumberOfLines,descriptionNumberOfLines)}
                {this.renderImage(imageLink,faviconLink,imageStyle,faviconStyle)}
            </TouchableOpacity>
        )
    }

    render() {
        const { text, onPress, containerStyle, imageStyle, faviconStyle, textContainerStyle, title, titleStyle, titleNumberOfLines, descriptionStyle, descriptionNumberOfLines } = this.props;
        return (
            this.state.isUri ?  this.renderLinkPreview(
                text, onPress, containerStyle,
                this.state.linkImg,this.state.linkFavicon,imageStyle,faviconStyle,
                title,this.state.linkTitle,this.state.linkDesc,textContainerStyle,titleStyle,descriptionStyle,titleNumberOfLines,descriptionNumberOfLines) : null
        );
    }


}

const styles = {
    containerStyle: {
        flexDirection: 'row',
    }
};


RNUrlPreview.defaultProps = {
    text: null,
    containerStyle: {
        backgroundColor: "rgba(239, 239, 244,0.62)",
        alignItems: 'center'
    },
    imageStyle: {
        width: Platform.isPad ? 160 : 85,
        height: Platform.isPad ? 160 : '100%',
        paddingRight: 10,
        paddingLeft: 5
    },
    faviconStyle: {
        width: 40,
        height: 40,
        paddingRight: 10,
        paddingLeft: 5
    },
    textContainerStyle: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingLeft: 5,
        paddingVertical: 10,
        paddingRight: 10
    },
    title: true,
    titleStyle: {
        fontSize: 12,
        color: '#000',
        marginRight: 10,
        marginTop: 10,
        marginBottom: 5,
        fontWeight: '500',
        alignSelf: 'flex-start'
    },
    titleNumberOfLines: 2,
    descriptionStyle: {
        fontSize: 10,
        marginRight: 10,
        fontWeight: '300',
        paddingBottom: 5,
        alignSelf: 'flex-start'
    },
    descriptionNumberOfLines: Platform.isPad ? 4 : 2,
};

RNUrlPreview.propTypes = {
    text: PropTypes.string,
    containerStyle: ViewPropTypes.style,
    imageStyle: ViewPropTypes.style,
    faviconStyle: ViewPropTypes.style,
    textContainerStyle: ViewPropTypes.style,
    title: PropTypes.bool,
    titleStyle: Text.propTypes.style,
    titleNumberOfLines: Text.propTypes.numberOfLines,
    descriptionStyle: Text.propTypes.style,
    descriptionNumberOfLines: Text.propTypes.numberOfLines,
};


