import React from "react";
import {
    Route
} from "react-router-dom";
import Loading from './Loading';
import { Redirect } from 'react-router-dom';
import { DateComponent } from "@fullcalendar/react";


function ProtectedRoute(props) {

    return (
        <Route exact path={props.path}>
            {
                (props.isLoading || props.user === null)
                    ? <Loading />
                    : props.user === false || Date.now() - new Date(props.user.metadata.lastSignInTime).getTime() > 1209600000
                        ? <Redirect to="/login" />
                        : props.children

            }
        </Route>
    )

}

export default ProtectedRoute;
