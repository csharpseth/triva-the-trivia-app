import React from 'react';

export default function CloseButton(props) {

    function Close() {
        if(props.onClose) {
            props.onClose()
        }
    }

    return (
        <div className="closeButton" onClick={Close}>
            <div></div><div></div>
        </div>
    );
}