import React from 'react';
import { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';

import '../../styles/Notification.css'
import { FittedButton } from './Button';
import CloseButton from './CloseButton';

export default function Notification() {

    const { notification } = useContext(ApplicationContext)

    return (
        <div className='notification' id={notification.active ? 'notificationOpen':''}>
            <CloseButton onClose={notification.onClose} />
            <p>{notification.body}</p>
            <div className="horizontal-flex-center-spread notificationOptions">
                {notification.options.map((opt, index) => 
                    <FittedButton
                        key={index}
                        value={opt.value}
                        styling={opt.style}
                        onPush={() => opt.action(index)} />
                )}
            </div>
        </div>
    );
}