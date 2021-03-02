// import { useState } from 'react';
import {Card, Nav, Tab } from 'react-bootstrap';
import './Patients.css';

function PatientCard(props) {
    return (
        <Card className="text-right h-100 mx-4">
        <Tab.Container defaultActiveKey="info" transition={false}>
            <Card.Header>
                <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="info">מידע</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="timeline">תקשורת לקוח</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="docs">מסמכים</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="images">תמונות</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Card.Header>
            <Card.Body>
                    <Tab.Content>
                        <Tab.Pane eventKey="info">
                        <Card.Title className="mt-2 mb-4">{props.selectedPatient ? props.selectedPatient.name : ""}</Card.Title>
                        <ul className="list-unstyled px-0">
                            <li className="py-2">{props.selectedPatient ? "מין: " + props.selectedPatient.gender : ""}</li>
                            <li className="py-2">{props.selectedPatient ? "תעודת זהות: " + props.selectedPatient.id : ""}</li>
                            <li className="py-2">{props.selectedPatient ? "מספר טלפון: " + props.selectedPatient.phone : ""}</li>
                            <li className="py-2">{props.selectedPatient ? "כתובת דוא\"ל: " + props.selectedPatient.email : ""}</li>
                            <li className="py-2">{props.selectedPatient ? "תאריך לידה: " + props.selectedPatient.birthDate : ""}</li>
                        </ul>
                        </Tab.Pane>
                        <Tab.Pane eventKey="timeline">
                            <ul className="px-0 list-unstyled">
                                <li className="py-2"></li>
                            </ul>
                        </Tab.Pane>
                        <Tab.Pane eventKey="docs">
                        <ul className="px-0 list-unstyled">
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank" 
                                        rel="noreferrer"
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">Another Example.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">abcdefg.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">hello world.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">file name.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">test.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">second test.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">very long example test file name.txt
                                    </a>
                                </li>
                            </ul>
                        </Tab.Pane>
                        <Tab.Pane eventKey="images">
                        <ul className="px-0 list-unstyled">
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/Photos/folder2?preview=Boston+City+Flow.jpg">Boston City Flow.jpg
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/Photos/folder2?preview=Boston+City+Flow.jpg">Another Image Link.jpg
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">hello world.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">file name.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">test.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">second test.txt
                                    </a>
                                </li>
                                <li className="py-2 coloredList">
                                    <a 
                                        target="_blank"
                                        rel="noreferrer" 
                                        href="https://www.dropbox.com/home/docs?preview=Another+Example.txt">very long example test file name.txt
                                    </a>
                                </li>
                            </ul>
                        </Tab.Pane>
                    </Tab.Content>
            </Card.Body>
            </Tab.Container>
        </Card>
    );
}

export default PatientCard;