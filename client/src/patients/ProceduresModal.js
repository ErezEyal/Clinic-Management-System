import { useRef } from "react";
import { Modal } from "react-bootstrap";

function ProceduresModal(props) {
  const inputRef = useRef();

  const plusIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-plus-square"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"
      />
      <path
        fillRule="evenodd"
        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
      />
    </svg>
  );

  const removeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="#dc3545d6"
      className="bi bi-x-circle-fill"
      viewBox="0 0 16 16"
    >
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
    </svg>
  );

  const handleAddition = (value) => {
      if (value) {
          props.updateProcedures(value, "add")
          inputRef.current.value = ""
      }
  } 

  return (
    <Modal onHide={props.hide} show={props.show} className="text-right">
      <div className="modal-content p-4" style={{ backgroundColor: "#f4f5f7" }}>
        <h4 className="mb-3">
          <span>פעולות</span>
        </h4>
        <div>
          <ul className="pr-0">
            {props.procedures.map((procedure, index) => {
              return (
                <li className="my-1">
                  <button
                    className="btn pt-0"
                    onClick={() => props.updateProcedures(procedure, "delete")}
                  >
                    {removeIcon}
                  </button>
                  <span>{procedure}</span>
                </li>
              );
            })}
            <li>
              <input
                placeholder="חדש..."
                className="mr-3 bg-transparent border-bottom border-top-0 border-left-0 border-right-0 outline-none"
                ref={inputRef}
              ></input>
              <button
                className="btn shadow-none text-primary mr-2"
                onClick={() => handleAddition(inputRef.current.value)}
              >
                {plusIcon}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}

export default ProceduresModal;