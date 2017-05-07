import React, {Component} from 'react';

class NotFound extends Component{
    render(){
        let imageURL = 'https://media.giphy.com/media/QUBtvGVOgmCcM/giphy.gif';
        return (
            <div className="FourOhFour">
                <div className="bg" style={{ backgroundImage: 'url(' + imageURL + ')'}}></div>
                <div className="code">404</div>
            </div>
        )        
    }
}
export default NotFound;
