import { Spinner } from 'react-bootstrap';
function Loading(props) {

    return (
        <div className="text-center" size="lg" style={{marginTop: "20vh"}} hidden={props.hidden}>
            <Spinner animation="grow" variant="secondary" />
        </div>
        
    );
}

export default Loading;