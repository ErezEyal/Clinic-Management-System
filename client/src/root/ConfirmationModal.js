import { Button, Modal } from "react-bootstrap";

function ConfirmationModal(props) {
  return (
    <>
      <Modal className="rtl" show={props.text} onHide={props.hide}>
        <Modal.Header>
          <Modal.Title>אישור שינויים</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-right">{props.text}</Modal.Body>
        <div>
        <hr />
        </div>
        <div className="text-right pb-3 px-2 pt-1">
            <Button variant="warning" className="mr-2" onClick={props.performAction}>
              בצע שינויים
            </Button>
            <Button variant="outline-secondary" className="float-left ml-2" onClick={props.hide}>
              ביטול
            </Button>
        </div>
      </Modal>
    </>
  );
}

export default ConfirmationModal;
