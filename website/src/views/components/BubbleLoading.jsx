import React from 'react';

import '../../styles/Loading.css'

export default function BubbleLoading(props) {
    return (
        <div className='loadingContainer'>
            <LoadingBubble id='bubble-3' />
            <LoadingBubble id='bubble-2' />
            <LoadingBubble id='bubble-1' />
            <h3 id='loadingText'>Loading</h3>
        </div>
    );
}

function LoadingBubble(props) {
    return (
        <div className='loadingBubble' id={props.id}></div>
    )
}