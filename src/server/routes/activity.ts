'use strict';
import { Request, Response } from "express";
import { performance } from "perf_hooks";
import { verify } from 'jsonwebtoken';

interface ExecuteLog {
    body: any;
    headers: any;
    trailers: any;
    method: any;
    url: any;
    params: any;
    query: any;
    route: any;
    cookies: any;
    ip: any;
    path: any;
    host: any;
    fresh: any;
    stale: any;
    protocol: any;
    secure: any;
    originalUrl: any;
}
const logExecuteData: ExecuteLog[] = [];
const logData = (req: Request) => {
    logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
}

import axios from 'axios';
interface RequestBody {
    sender: string;
    urgente: 0 | 1;
    validar: 0 | 1;
    mensaje: string;
    bill_number: string;
    source: string;
}
interface InputParamenter {
    mensajeTraducido?: string;
    cellularNumber?: string;
    remitente?: string;
    bill_number?: string;
    smsAction?: SmsAction;
    expireDateModifier?: string;
    saveActionCountry?: string;
}
interface DecodedBody {
    inArguments?: InputParamenter[];
}
interface DurationTimestampsPair {
    start: number | null;
    end: number | null;
}

const execute = async function (req: Request, res: Response) {
    const { body } = req;
    const { env: { JWT_SECRET } } = process;

    if (!body) {
        console.error(new Error('invalid jwtdata'));
        return res.status(401).end();
    }
    if (!JWT_SECRET) {
        console.error(new Error('jwtSecret not provided'));
        return res.status(401).end();
    }

    verify(
        body.toString('utf8'),
        JWT_SECRET,
        { algorithms: ['HS256'], complete: false },
        async (err, decoded?: DecodedBody) => {
            if (err) {
                console.error(err);
                return res.status(401).end();
            }
            if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
                const requestBody: Partial<RequestBody> = { sender: 'Claro', urgente: 1, validar: 0 };
                let smsAction: SmsAction | null = null;
                let message: string | null = null;
                let bill_number: string | null = null;
                let source: string | null = null;
                let expireDateModifier: string = '1/24';
                let saveActionCountry: string = 'AR';
                for (const argument of decoded.inArguments) {
                    if (argument.mensajeTraducido) message = argument.mensajeTraducido;
                    else if (argument.cellularNumber) bill_number = argument.cellularNumber;
                    else if (argument.remitente) source = argument.remitente;
                    else if (argument.smsAction) smsAction = argument.smsAction;
                    else if (argument.expireDateModifier) expireDateModifier = argument.expireDateModifier;
                    else if (argument.saveActionCountry) saveActionCountry = argument.saveActionCountry;
                }

                if (
                    !message ||
                    !bill_number ||
                    !source
                ) return res.status(400).send(`Input parameter is missing.`);

                if (smsAction === SmsAction.SEND) {
                    requestBody.mensaje = message;
                    requestBody.bill_number = bill_number;
                    requestBody.source = source;

                    const { env: { RCS_SMS_API_URL, RCS_API_KEY } } = process;
                    const brokerRequestDurationTimestamps: DurationTimestampsPair = { start: performance.now(), end: null };

                    let URL = RCS_SMS_API_URL

                    const loginResponse = await axios.post(
                        `${URL}/auth/login`,
                        requestBody,
                        {
                            headers: {
                                apikey : RCS_API_KEY
                            }
                        }
                    )
                    .catch((error) => {
                        brokerRequestDurationTimestamps.end = performance.now();
                        if (error.response) {
                            const { data, status } = error.response;
                            specialConsoleLog(
                                requestBody.bill_number!,
                                'BROKER_REQUEST_FAILED',
                                brokerRequestDurationTimestamps,
                                { data, status }
                            );
                        }
                    });
                    
                    brokerRequestDurationTimestamps.end = performance.now();
                    let messageSendingFailed = !loginResponse ? true : false;
                    
                    if (!messageSendingFailed && loginResponse) {
                        const { data, status } = loginResponse;
                    
                        if (status === 200 && data.responseCode !== 0) {
                            specialConsoleLog(
                                requestBody.bill_number,
                                'BROKER_RESPONSE_FAILED',
                                brokerRequestDurationTimestamps,
                                { data, status }
                            );
                            messageSendingFailed = true;
                        }
                         else {
                            specialConsoleLog(
                                requestBody.bill_number!,
                                'BROKER_REQUEST_SUCCESS',
                                brokerRequestDurationTimestamps,
                                { data, status }
                            );
                        }
                    }
                    
                    let brokerStatus = false;
                    if (!messageSendingFailed) {
                        brokerStatus = !!(loginResponse && loginResponse.data);
                    }
                    
                    const output = {
                        brokerStatus: brokerStatus,
                        Sender: source,
                    };
                    
                    return res.status(200).send(output);
                    
                } 

            } else {
                console.error('inArguments invalid.');
                return res.status(400).end();
            }
        },
    );
};

const edit = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Edit');
};

const save = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Save');
};

const publish = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Publish');
};

const validate = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Validate');
};

const stop = (req: any, res: any) => {
    logData(req);
    res.send(200, 'Stop');
};

function millisToMinutesAndSeconds(millis: number): string {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return Number(seconds) == 60 ? minutes + 1 + 'm' : minutes + 'm ' + (Number(seconds) < 10 ? '0' : '') + seconds + 's';
}

function specialConsoleLog(
    phoneNumber: string,
    eventName: string,
    durationTimestamps: DurationTimestampsPair,
    data: any,
): void {
    const now = new Date();
    const todayDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    const currentTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    const { start, end } = durationTimestamps;
    let duration = '-';
    if (start && end) duration = millisToMinutesAndSeconds(end - start);

    const jsonifiedData = JSON.stringify(data);

    console.log(`${todayDate}|${currentTime}|${phoneNumber}|${eventName}|${duration}|${jsonifiedData}`);
}

export default {
    logExecuteData,
    execute,
    edit,
    save,
    publish,
    validate,
    stop,
};
