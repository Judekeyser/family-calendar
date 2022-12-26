import './App.css';
import React from 'react';
import { map } from 'rxjs';
import { Tissue } from './Tissue'


function ControlledAppointmentForm({
    _inStrDate,
    _inStrTime,
    _inStrDescription,
    _ctrlDate,
    _allowCancel,
    _eventOfData,
    title
}) {
    _allowCancel = _allowCancel && (
        !!_inStrDate && !!_inStrTime && !!_inStrDescription
    );
    let [strDate, setStrDate] = React.useState(_inStrDate || dateToString(new Date()));
    let [strTime, setStrTime] = React.useState(_inStrTime || "12:00");
    let [strDescription, setStrDescription] = React.useState(_inStrDescription || "");
    let [doCancel, setDoCancel] = React.useState(false);
    let [isFrozen, setIsFrozen] = React.useState(false);
    
    React.useEffect(() => {
        if(doCancel && !isFrozen) {
            setStrDate(_inStrDate);
            setStrTime(_inStrTime);
            setStrDescription(_inStrDescription);
        }
    }, [doCancel, isFrozen, _inStrDate, _inStrTime, _inStrDescription]);
    
    function InternalComputer({ strDate, strTime, strDescription, doCancel }) {
        React.useEffect(() => {
            let newEvent = _eventOfData({
                strDate,
                strTime,
                strDescription,
                doCancel
            });
            (async () => {
                try{
                    await Tissue.sendEvent({
                        newEvent,
                        continueSignal: response => true
                    });
                } catch(e) {
                    console.error(e);
                } finally {
                    setIsFrozen(false);
                    Tissue.closePanel();
                }
            })()
        }, [strDate, strTime, strDescription, doCancel]);
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        setIsFrozen(true);
        return false;
    }
    
    const canSendNewEvent = strDescription && strTime && strDate;
    
    return (
        <aside>
            <header>
                <h1>{title}</h1>
                <nav>
                    <input type='button' onClick={() => Tissue.closePanel()} value="Fermer" />
                </nav>
            </header>
            
            <form onSubmit={handleFormSubmit}>
                {_allowCancel && (
                    <>
                        <label>
                            Annuler le rendez-vous:
                            {' '}
                            <input type="checkbox" onChange={e => setDoCancel(e.target.checked)} />
                        </label>
                        <hr />
                    </>
                )}
                <fieldset>
                    <legend>Date et heure</legend>
                    
                    <div className="multi-col">
                        <div className="col-2 center">
                            <label>
                                Date:
                                <br />
                                <input type="date" value={strDate} onChange={e => setStrDate(e.target.value)}
                                    readOnly={!_ctrlDate || doCancel} disabled={!_ctrlDate || doCancel}
                                    />
                            </label>
                        </div>
                        <div className="col-2 center">
                            <label>
                                Heure:
                                <br />
                                <input type="time" value={strTime} onChange={e => setStrTime(e.target.value)}
                                    readOnly={doCancel} disabled={doCancel}
                                    />
                            </label>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>Description du rendez-vous</legend>
                    
                    <textarea onChange={e => setStrDescription(e.target.value)} value={strDescription}
                        readOnly={doCancel} disabled={doCancel}
                        ></textarea>
                </fieldset>
                <hr />
                
                {
                    isFrozen && (
                        <>
                            <InternalComputer strDate={strDate} strTime={strTime} strDescription={strDescription} doCancel={doCancel} />
                            <span>Envoi&hellip;</span>
                        </>
                    )
                }
                {' '}
                {
                    doCancel ? (
                        <input type="submit" value="Annuler" />
                    ) : (
                        <input type="submit" value="Ajouter" disabled={!canSendNewEvent} />
                    )
                }
            </form>
        </aside>
    )
}

function NewAppointmentRoute({ strDate }) {
    
    React.useEffect(() => {
        if(! strDate) {
            console.error("Page opened with not every information provided");
        }
    }, [strDate])
    
    function eventOfData({ strTime, strDescription }) {
        return {
            strDate, strTime, strDescription,
            kind: "create",
            version: 1,
            userInitiator: window.localStorage.getItem('userName')
        }
    }
    
    return (
        <ControlledAppointmentForm
            title="Nouveau rendez-vous"
            _inStrDate={strDate}
            _eventOfData={eventOfData}
        />
    )
}

function EditAppointmentRoute({ strDate, strTime }) {
    React.useEffect(() => {
        if(! strDate && !strTime) {
            console.error("Page opened with not every information provided");
        }
    }, [strDate, strTime])
    
    function InternalRedirect() {
        console.error("Page opened at date", strDate, "and time", strTime, ", but nothing available");
        React.useEffect(() => {
            Tissue.openPanel([]);
        })
    }
    
    function eventOfData(x) {
        if(x.doCancel) {
            let { strDate, strTime } = x;
            return {
                strDate, strTime,
                kind: "cancel",
                version: 1
            }
        }
        else if(strDate === x.strDate && strTime === x.strTime) {
            // Modification without need to cancel out 
            return {
                strDate, strTime,
                strDescription: x.strDescription,
                kind: "create",
                version: 1,
                userInitiator: window.localStorage.getItem('userName')
            }
        } else {
            let toCancel = {
                strTime, strDate,
                version: 1,
                kind: "cancel"
            };
            let toCreate = {
                strDate: x.strDate,
                strTime: x.strTime,
                strDescription: x.strDescription,
                version: 1,
                kind: "create",
                userInitiator: window.localStorage.getItem('userName')
            };
            return {
                toCancel, toCreate,
                version: 2,
                userInitiator: window.localStorage.getItem('userName')
            }
        }
    }
    
    let eventDescription$ = Tissue.calendarCell$(strDate).pipe(
        map(cell => {
            if(! cell.detail)
                return {};
            let maybeDetail = cell.detail[strTime];
            if(! maybeDetail)
                return {};
            let description = maybeDetail.description || "";
            return { description };
        })
    );
    
    return (
        <Async observable$={eventDescription$}>{
            ({ notfound, description }) => !description ? (
                <InternalRedirect />
            ) : (
                <ControlledAppointmentForm
                    title="Modifier le rendez-vous"
                    _inStrDate={strDate}
                    _inStrTime={strTime}
                    _inStrDescription={description}
                    _allowCancel={true}
                    _ctrlDate={true}
                    _eventOfData={eventOfData}
                />
            )
        }</Async>
    )
}

function AppointmentsRoute({ strDate }) {
    
    return (
        <aside className="detail">
            <header>
                <h1>Détail du jour</h1>
                <nav>
                    <input type='button' onClick={() => Tissue.closePanel()} value="Fermer" />
                </nav>
            </header>
            
            <div className="grid">
                <Async observable$={Tissue.calendarCell$(strDate)}>{
                    cell => cell.loading ? (
                        <p className="loading">Chargement du contenu&hellip;</p>
                    ) : cell.empty ? (
                        <p>Pas d'événement prévu à cette date</p>
                    ) : (
                        <div>
                        {cell.sortedKeys
                            .map(strTime => ([ strTime, cell.detail[strTime]]))
                            .map(([strTime, detail]) => (
                                <article key={strTime} onClick={() => Tissue.openPanel(["appointments", strDate, strTime, 'edit' ])}>
                                    <h1>{strTime}{detail.unread && '*'}</h1>
                                    
                                    <p>{detail.description}</p>
                                </article>
                            )
                        )}
                        </div>
                    )
                }</Async>
            </div>
            
            <footer>
                <nav>
                    <input type='button' onClick={() => Tissue.openPanel(['appointments', strDate, 'new' ])} value="Nouveau" />
                </nav>
            </footer>
        </aside>
    )
}

function UnreadAppointmentsRoute() {
    
    return (
        <aside className="detail">
            <header>
                <h1>Événements non lus</h1>
                <nav>
                    <input type='button' onClick={() => Tissue.closePanel()} value="Fermer" />
                </nav>
            </header>
            
            <Async observable$={Tissue.unreadCells$()}>{
                cells => (
                    <>
                        <div className="grid">{
                            cells.loading ? (
                                <p className="loading">Chargement du contenu&hellip;</p>
                            ) : cells.empty ? (
                                <p>Tous les événements sont lus</p>
                            ) : (
                                <div>
                                {
                                    cells.sortedKeys
                                    .map(strDate => cells.detail[strDate].sortedKeys.map(strTime => (
                                        <article key={strDate + "-" + strTime} onClick={() => Tissue.openPanel(["appointments", strDate, strTime, 'edit' ])}>
                                            <h1>Le {[strDate.substring(8, 10), strDate.substring(5,7), strDate.substring(0,4)].join('/')} à {strTime}</h1>
                                            
                                            <p>{cells.detail[strDate].detail[strTime]}</p>
                                        </article>
                                    ))).reduce((a,b) => [...a, ...b], [])
                                }
                                </div>
                            )
                        }</div>
            
                        {
                            !cells.loading && !cells.empty ? (
                                <footer>
                                    <nav>
                                        <input type='button' onClick={() => Tissue.markAllAsRead()}
                                            value="Tout marquer comme lu"
                                            />
                                    </nav>
                                </footer>
                            ) : null
                        }
                    </>
                )
            }</Async>
        </aside>
    )
}

function CalendarRoute() {
    function anyUnreadEvent({ detail }) {
        return !!Object.values(detail)
            .map(({ unread }) => !!unread)
            .map(b => b)
            [0];
    }
    
    function RowCountHolder(props) {
        let { rowCount } = props;
        let [internalRowCount, setInternalRowCount] = React.useState(rowCount || 4);
        
        React.useEffect(() => {
            if(internalRowCount) {
                if(rowCount !== internalRowCount) {
                    Tissue.setViewRowCount(internalRowCount);
                }
            }
        }, [rowCount, internalRowCount]);
        
        return props.children({
            rowCount: internalRowCount,
            emitRowCount: setInternalRowCount
        })
    }
    
    function FocusDateHolder(props) {
        let { focusDate } = props;
        let [internalFocusDate, setInternalFocusDate] = React.useState(focusDate || dateToString(new Date()));
        
        React.useEffect(() => {
            if(internalFocusDate) {
                if(focusDate !== internalFocusDate) {
                    Tissue.setViewFocusDate(internalFocusDate);
                }
            }
        }, [focusDate, internalFocusDate]);
        
        function nextWeekDate() {
            let currentTime = Date.parse(internalFocusDate);
            let currentDayOfWeek = new Date(currentTime).getDay();
            
            currentTime += 1000 * 60 * 60 * 24 * 5;
            do {
                currentTime += 1000 * 60 * 60 * 12;
            } while(currentDayOfWeek !== new Date(currentTime).getDay());
            
            setInternalFocusDate(dateToString(new Date(currentTime)));
        }
        
        function previousWeekDate() {
            let currentTime = Date.parse(internalFocusDate);
            let currentDayOfWeek = new Date(currentTime).getDay();
            
            currentTime -= 1000 * 60 * 60 * 24 * 5;
            do {
                currentTime -= 1000 * 60 * 60 * 12;
            } while(currentDayOfWeek !== new Date(currentTime).getDay());
            
            setInternalFocusDate(dateToString(new Date(currentTime)));
        }
        
        return props.children({
            focusDate: internalFocusDate,
            emitFocusDate: setInternalFocusDate,
            emitNextWeekDate: nextWeekDate,
            emitPreviousWeekDate: previousWeekDate
        })
    }
    
    return (
<aside>
    <form>
        <fieldset>
            <legend>Configuration du calendrier</legend>
            
            <div className="multi-col">
                <div className="col-2 center">
                    <label>
                        Nombre de semaines affichées<br />
                        <Async observable$={Tissue.viewRowCount$()}>{
                            rowCount => (
                                <RowCountHolder rowCount={rowCount}>{
                                    ({ rowCount, emitRowCount }) => (
                                        <input type="range" min="1" max="9" name="nbrWeeks"
                                            value={rowCount}
                                            onChange={e => emitRowCount(e.target.value)}
                                        />
                                    )
                                }</RowCountHolder>
                            )
                        }</Async>
                    </label>
                </div>
                <div className="col-2 center">
                    <Async observable$={Tissue.viewFocusDate$()}>{
                        focusDate => (
                            <FocusDateHolder focusDate={focusDate}>{
                                ({ focusDate, emitFocusDate, emitNextWeekDate, emitPreviousWeekDate }) => (
                                    <>
                                        <label>
                                            Première semaine inclus<br />
                                            <input type="date" name="startDate" value={focusDate} onChange={e => emitFocusDate(e.target.value)} />
                                        </label>
                                        <hr />
                                        <input type="button" name="prevWeek" value="<" onClick={emitPreviousWeekDate} />&nbsp;
                                        <input type="button" name="nextWeek" value=">" onClick={emitNextWeekDate} />
                                    </>
                                )
                            }</FocusDateHolder>
                        )
                    }</Async>
                </div>
            </div>
        </fieldset>
        <hr />
        <fieldset>
            <legend>Vue d'ensemble</legend>
            <table>
                <thead>
                    <tr>
                        <th><abbr>Lun.</abbr></th>
                        <th><abbr>Mar.</abbr></th>
                        <th><abbr>Mer.</abbr></th>
                        <th><abbr>Jeu.</abbr></th>
                        <th><abbr>Ven.</abbr></th>
                        <th className="saturday"><abbr>Sam.</abbr></th>
                        <th><abbr>Dim.</abbr></th>
                    </tr>
                </thead>
                <tbody>
                    <Async observable$={Tissue.viewRowCount$()}>{
                        count => {
                            let uuid = Math.floor((Math.random() * 100000)) + '-' + count + '-';
                            let rows = [];
                            for(let i = 1; i <= count; i++) {
                                let cols = [1,2,3,4,5,6,7]
                                        .map(k => (
                                            <Async key={uuid+i+'-'+k} observable$={Tissue.dayInGrid$(i, k)}>{
                                                ({ dayInGrid, sameMonthAsFocus, sameDayAsFocus, today }) => (
                                                    <Async observable$={Tissue.calendarCell$(dayInGrid)}>{
                                                        cell => (
                                                            <td className={[
                                                                k === 6 ? "saturday": null,
                                                                today ? "today" : null,
                                                                cell.loading ? "loading" : null,
                                                                !cell.loading && !cell.empty ? "nonempty" : null
                                                            ].filter(cls => !!cls).join(' ')} onClick={
                                                                () => Tissue.openPanel(["appointments", dayInGrid ])
                                                            }>
                                                                <span>
                                                                    {dayInGrid.substring(8, 10)}
                                                                    {!cell.loading && !cell.empty && anyUnreadEvent(cell) ? '*' : null}
                                                                    {
                                                                        !sameMonthAsFocus && (
                                                                            <span className="month">{dayInGrid.substring(5,7)}</span>
                                                                        )
                                                                    }
                                                                </span>
                                                            </td>
                                                        )
                                                    }</Async>
                                                )
                                            }</Async>
                                        ))
                                rows[i] = (
                                    <tr key={uuid+i}>{cols}</tr>
                                )
                            }
                            return rows;
                        }
                    }</Async>
                </tbody>
            </table>
        </fieldset>
    </form>
    <hr />
    <p>
        <input type="button" value="Voir tous les non lus" onClick={() => Tissue.openPanel(["appointments", "unreads"])} />
    </p>
</aside>
    )
}

function IdentificationForm() {
    let [identifiedUser, setIdentifiedUser] = React.useState(undefined);
    
    React.useEffect(() => {
        if(identifiedUser) {
            window.localStorage.setItem('userName', identifiedUser);
            Tissue.setUser(identifiedUser);
        }
    }, [identifiedUser])
    
    {
        // Make local storage agree on component
        let userInStore = window.localStorage.getItem('userName') || undefined;
        if(userInStore !== "justin" && userInStore !== "caroline") {
            window.localStorage.removeItem('userName');
        } else if(userInStore && userInStore !== identifiedUser) {
          if(identifiedUser) {
            window.localStorage.removeItem('userName')
          } else {
            setIdentifiedUser(userInStore);
            return;
          }
        }
    }
    
    const canSubmit = !!identifiedUser;
    
    function handleFormSubmit(e) {
      e.preventDefault();
      let selectedUser = e.target.userId.value;
      if(selectedUser !== identifiedUser) {
        throw new Error("Component in corrupted state");
      } else {
        setIdentifiedUser(selectedUser);
      }
      return false;
    }
    
    return (
<form onSubmit={handleFormSubmit}>
    <fieldset>
        <legend>Identifiant utilisateur</legend>
        
        <label>
            <input type="radio" name="userId" value="caroline"
              onChange={e => setIdentifiedUser(e.target.value)}
              checked={identifiedUser === 'caroline'} />
            &nbsp;Caroline
        </label>
        <br />
        <label>
            <input type="radio" name="userId" value="justin"
              onChange={e => setIdentifiedUser(e.target.value)}
              checked={identifiedUser === 'justin'} />
            &nbsp;Justin
        </label>
    </fieldset>
    <hr />
    
    <input type="submit" value="Ok" disabled={!canSubmit} />
</form>
    )
}

function AuthenticationForm({ alreadyAuthentified }) {
    let [isPasswordDisplayed, setIsPasswordDisplayed] = React.useState(false);
    let [isFrozen, setIsFrozen] = React.useState(true);
    let [isDisabled, setIsDisabled] = React.useState(true);
    let [passwordChallenge, setPasswordChallenge] = React.useState(undefined);
    let [errorMessage, setErrorMessage] = React.useState(undefined);
    
    function handleFormSubmit(e)
    {
        e.preventDefault();
        setErrorMessage(undefined);
        setIsPasswordDisplayed(false);
        setPasswordChallenge(e.target.passwordField.value || undefined);
        setIsFrozen(true);
        return false;
    }
    
    function InternalComputer({ passwordChallenge }) {
        React.useEffect(() => {
            (async () => {
                try{
                    await Tissue.sendEvent({
                        password: passwordChallenge,
                        continueSignal: async response => {
                            if(response.status === 401) {
                                let content = await response.json();
                                setErrorMessage(content);
                                return false;
                            } return true;
                        }
                    });
                } catch(e) {
                    console.error(e);
                } finally {
                    setIsFrozen(false)
                }
            })()
        });
    }
    
    function handleInputChange(e) {
        let value = (e.target.value || "").trim();
        if(!value && !isDisabled) {
            setIsDisabled(true);
        } else if(value && isDisabled) {
            setIsDisabled(false);
        }
    }
    
    const passwordFieldType = isPasswordDisplayed ? "text" : "password";
    return (
<form onSubmit={handleFormSubmit}>
    <fieldset>
        <legend>Information d'authentification</legend>
        {
            alreadyAuthentified ? (
                "Vous êtes déjà authentifié"
            ) : (
                <>
                    <label>
                        Mot de passe:{' '}
                        <input name="passwordField" type={passwordFieldType}
                                disabled={isFrozen}
                                onChange={handleInputChange}
                        />
                    </label>{' '}
                    
                    <label>
                        <input type="checkbox"
                            disabled={isFrozen}
                            checked={isPasswordDisplayed}
                            onChange={e => setIsPasswordDisplayed(e.target.checked)} /> {' '}
                        <small>Montrer</small>
                    </label>
                </>
            )
        }
    </fieldset>
    <hr />
    
    {
        isFrozen && !alreadyAuthentified ? (
            <>
                <span>Connexion&hellip;</span>
                <InternalComputer passwordChallenge={passwordChallenge} />
            </>
        ) : null
    }
    {
        errorMessage && !alreadyAuthentified ? (
            <span>{errorMessage}</span>
        ) : null
    }
    {' '}
    <input type="submit" value="Ok" disabled={alreadyAuthentified || isFrozen || isDisabled} />
</form>
    );
}


function App() {
  return (
    <Async observable$={Tissue.identifiedUser$()}>{
        identifiedUser => (
            identifiedUser ? (
                <Async observable$={Tissue.authenticationRequired$()}>{
                    authenticationRequired => (
                        authenticationRequired ? (
                            <aside>
                                <AuthenticationForm alreadyAuthentified={!authenticationRequired} />
                            </aside>
                        ) : (
                            <Async observable$={Tissue.openedPanel$()}>{
                                urlSegments => urlSegments.length === 0 ? (
                                    <CalendarRoute />
                                ) : urlSegments[0] === "appointments" ? (
                                    urlSegments.length === 2 ? (
                                        urlSegments[1] === "unreads" ? (
                                            <UnreadAppointmentsRoute />
                                        ) : (
                                            <AppointmentsRoute strDate={urlSegments[1]} />
                                        )
                                    ) : urlSegments[urlSegments.length-1] === "new" ? (
                                        <NewAppointmentRoute strDate={urlSegments[1]} />
                                    ) : urlSegments[urlSegments.length-1] === "edit" ? (
                                        <EditAppointmentRoute strDate={urlSegments[1]} strTime={urlSegments[2]} />
                                    ) : null
                                ) : null
                            }</Async>
                        )
                    )
                }</Async>
            ) : (
                <aside>
                    <IdentificationForm />
                </aside>
            )
        )
    }</Async>
  );
}

function Async(props)
{
    let { observable$ } = props;
    let [value, setValue] = React.useState(undefined);
    
    let rxjsRef = React.useRef(undefined);
    
    React.useEffect(() => {
        rxjsRef.current = observable$.subscribe(
            newValue => setValue(newValue)
        )
        
        return () => rxjsRef.current.unsubscribe()
    }, [observable$]);
  
    if(value !== undefined)
    return props.children(value);
}


function dateToString(date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    
    return year + '-' + (
            month < 10 ? '0' : ''
        ) + month + '-' + (
            day < 10 ? '0' : ''
        ) + day;
}

export default App;
