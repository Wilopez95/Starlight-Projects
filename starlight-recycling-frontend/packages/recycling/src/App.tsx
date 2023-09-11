import React, { useRef, useState } from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { Trans } from './i18n';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import CloseIcon from '@material-ui/icons/Close';
import MenuIcon from '@material-ui/icons/Menu';
import { createStyles } from '@material-ui/styles';
import {
  IconButton,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Box,
  CssBaseline,
  Typography,
} from '@material-ui/core';

import {
  FinishLogin,
  IsLoggedIn,
  NotLoggedIn,
  ProtectedRoute,
  RedirectToLobby,
  RedirectToLogin,
} from '@starlightpro/common';
import LoginView from './views/LoginView';
import CompanyInfo from './components/CompanyInfo';
import UserMenu from './components/UserMenu';
import SidePanels from './components/SidePanels';
import Modals from './components/Modals';
import { PageTitle } from './components/PageTitle';
import { DocumentTitle } from './components/DocumentTitle';
import YardOperationConsole from './views/YardOperationConsole';
import Scale from './components/Scale';
import { FullTruckToScaleButton } from './views/YardOperationConsole/components/FullTruckToScaleButton';
import { EmptyTruckToScaleButton } from './views/YardOperationConsole/components/EmptyTruckToScaleButton';
import { EmptyTruckBypassScaleButton } from './views/YardOperationConsole/components/EmptyTruckBypassScaleButton';
import { YardInstructionsButton } from './views/YardOperationConsole/components/YardInstructionsButton';
import { LobbyMenu } from './components/LobbyMenu';
import LoadCompanySettings from './components/LoadCompanySettings';
import { GradingTabletDetails, GradingTabletList } from './views/GradingTabletView';
import { useDrawerState } from './hooks/useDrawerState';
import { Paths, Routes } from './routes';
import { PrintNodeProvider } from './components/PrintNode';
import { ScaleProvider } from './components/Scale';
import AccountsButton from './components/AccountsButton';
import {
  KioskView,
  KioskSelfServiceView,
  KioskTruckOnScalesView,
  KioskAttachPhotosView,
  KioskInboundSummaryView,
} from './views/Kiosk';
import { BasePaths } from './routes/BasePaths';
import { PrintWeightTicketProvider } from './components/PrintWeightTicket/PrintWeightTicket';
import { DriverProvider } from './views/Kiosk/components/DriverContext/DriverContext';
import { MaterialOrderContext } from './utils/contextProviders/MaterialOrderProvider';

const useStyles = makeStyles(
  ({ appHeader, appDrawer, spacing, palette, zIndex, breakpoints }) =>
    createStyles({
      root: {
        display: 'flex',
        position: 'relative',
        height: '100vh',
      },
      kioskRoot: {
        background: palette.common.white,
      },
      kioskHeader: {
        height: appHeader.height,
        padding: spacing(2),
        display: 'flex',
      },
      kioskMain: {
        height: `calc(100vh - ${appHeader.height}px)`,
        display: 'flex',

        '& > div': {
          width: '100%',
        },

        '& .MuiFormControl-root': {
          marginBottom: spacing(3),
        },
      },
      appBar: {
        zIndex: zIndex.drawer + 1,
      },
      toolbar: {
        height: appHeader.height,
        flexShrink: 0,
      },
      drawer: {
        width: appDrawer.width,
        flexShrink: 0,
      },
      drawerPaper: {
        width: appDrawer.width,
        backgroundColor: palette.grey[900],
        color: palette.common.white,
        border: 'none',
      },
      drawerPaperTablet: {
        height: `calc(100% - ${appHeader.height}px)`,
        top: appHeader.height,
      },
      drawerContainer: {},
      content: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginTop: appHeader.height,
        width: `calc(100% - ${appDrawer.width}px)`,
      },
      mobileContent: {
        flexGrow: 1,
        padding: 0,
        marginTop: appHeader.height,
      },
      drawerItem: {
        margin: spacing(3),
      },
      divider: {
        margin: spacing(2, 3),
        background: palette.grey[800],
      },
      yardOperationButton: {
        marginBottom: '1rem',
      },
      menuButton: {
        maxWidth: '6rem',
        marginRight: spacing(2),
        [breakpoints.up('lg')]: {
          display: 'none',
        },
      },
    }),
  { name: 'App' },
);

function App() {
  const classes = useStyles();
  const { open, desktop, tablet, handleDrawerToggle, handleDrawerSet } = useDrawerState();
  const mainRef = useRef<any>();

  const location = useLocation();
  const isGrading = () => {
    return location.pathname.includes(`/${Routes.Grading}`);
  };
  const toggleDrawerButton = ({ onlyMenuIcon = false } = {}) =>
    tablet && (
      <IconButton
        color="inherit"
        data-cy={open ? 'Close Drawer Icon' : 'Menu Icon'}
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        className={classes.menuButton}
      >
        {open && !onlyMenuIcon ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
    );

  const [material, setMaterial] = useState<any>(undefined);

  return (
    <>
      <CssBaseline />
      <DocumentTitle />
      <NotLoggedIn>
        <Switch>
          <Route path="/login/:loginId" component={LoginView} />
          <Route path="/login" exact component={LoginView} />
          <Route path="/finish-login" exact component={FinishLogin} />
          <Route path={`/${Routes.Console}`}>
            <Switch>
              <Route path={`/${Routes.Console}/login/:loginId`} component={LoginView} />
              <Route path={`/${Routes.Console}/login`} exact component={LoginView} />
              <Route path={`/${Routes.Console}/finish-login`} exact component={FinishLogin} />
              <RedirectToLobby />
            </Switch>
          </Route>
          <Route path={`/${Routes.Grading}`}>
            <Switch>
              <Route path={`/${Routes.Grading}/login/:loginId`} component={LoginView} />
              <Route path={`/${Routes.Grading}/login`} exact component={LoginView} />
              <Route path={`/${Routes.Grading}/finish-login`} exact component={FinishLogin} />
              <RedirectToLobby />
            </Switch>
          </Route>
          <Route path={`/${Routes.Kiosk}`}>
            <Switch>
              <Route path={`/${Routes.Kiosk}/login/:loginId`} component={LoginView} />
              <Route path={`/${Routes.Kiosk}/login`} exact component={LoginView} />
              <Route path={`/${Routes.Kiosk}/finish-login`} exact component={FinishLogin} />
              <RedirectToLogin auto />
            </Switch>
          </Route>
          <BasePaths />
        </Switch>
      </NotLoggedIn>
      <IsLoggedIn>
        <MaterialOrderContext.Provider value={{ material, setMaterial }}>
          <Switch>
            <ProtectedRoute
              permissions="recycling:SelfService:full-access"
              path={Paths.KioskModule.Kiosk}
            >
              <DriverProvider>
                <PrintNodeProvider>
                  <ScaleProvider>
                    <Box className={classes.kioskRoot}>
                      <Box pt={4} pb={2} className={classes.kioskHeader}>
                        <CompanyInfo notClickableLogo />
                        <UserMenu
                          showHelpIcon={false}
                          showLangSwitch={false}
                          showGreetings={false}
                        />
                      </Box>
                      <Box className={classes.kioskMain}>
                        <Switch>
                          <Route path={Paths.KioskModule.Kiosk} exact component={KioskView} />
                          <Route
                            path={Paths.KioskModule.SelfService}
                            exact
                            component={KioskSelfServiceView}
                          />
                          <Route
                            path={Paths.KioskModule.AttachPhotos}
                            exact
                            component={KioskAttachPhotosView}
                          />
                          <Route
                            path={Paths.KioskModule.InboundSummary}
                            exact
                            component={KioskInboundSummaryView}
                          />
                          <Route
                            path={Paths.KioskModule.EditSelfServiceOrder}
                            exact
                            component={KioskSelfServiceView}
                          />
                          <Route
                            path={Paths.KioskModule.TruckOnScale}
                            exact
                            component={KioskTruckOnScalesView}
                          />
                        </Switch>
                      </Box>
                    </Box>
                    <Modals />
                  </ScaleProvider>
                </PrintNodeProvider>
              </DriverProvider>
            </ProtectedRoute>
            <Route>
              <PrintNodeProvider>
                <ScaleProvider>
                  <PrintWeightTicketProvider>
                    <LoadCompanySettings />
                    <div className={classes.root}>
                      <AppBar position="fixed" color="default" className={classes.appBar}>
                        <Toolbar className={classes.toolbar}>
                          {!isGrading() && toggleDrawerButton({ onlyMenuIcon: true })}
                          <LobbyMenu />
                          <CompanyInfo />
                          <PageTitle />
                          <UserMenu />
                        </Toolbar>
                      </AppBar>
                      <Route path={`/${Routes.Console}`}>
                        <SwipeableDrawer
                          open={open}
                          className={classes.drawer}
                          variant={desktop ? 'permanent' : 'temporary'}
                          classes={{
                            paper: clsx(classes.drawerPaper, {
                              [classes.drawerPaperTablet]: !desktop,
                            }),
                          }}
                          ModalProps={{ onBackdropClick: handleDrawerToggle }}
                          onClose={handleDrawerSet.bind(null, false)}
                          onOpen={handleDrawerSet.bind(null, true)}
                        >
                          {toggleDrawerButton()}
                          {desktop && <Toolbar className={classes.toolbar} />}

                          <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="space-between"
                            height="100%"
                          >
                            <Box>
                              <Box className={classes.drawerItem}>
                                <AccountsButton className={classes.yardOperationButton} />{' '}
                              </Box>
                              <Box className={classes.drawerItem}>
                                <Scale />
                              </Box>
                              <Box className={classes.drawerItem}>
                                <FullTruckToScaleButton formContainer={mainRef.current} />
                              </Box>
                              <Box className={classes.drawerItem}>
                                <EmptyTruckToScaleButton formContainer={mainRef.current} />
                              </Box>
                              <Box className={classes.drawerItem}>
                                <EmptyTruckBypassScaleButton formContainer={mainRef.current} />
                              </Box>
                              <Typography variant="caption" className={classes.drawerItem}>
                                * <Trans>Must have tare weight</Trans>
                              </Typography>
                            </Box>
                            <Box className={classes.drawerItem}>
                              <YardInstructionsButton />
                            </Box>
                          </Box>
                        </SwipeableDrawer>
                      </Route>
                      <main className={classes.content} ref={mainRef}>
                        <Switch>
                          <Route path="/login" exact component={LoginView} />
                          <Route path="/finish-login" exact component={FinishLogin} />
                          <Route path={`/${Routes.Console}`}>
                            <Switch>
                              <Route
                                path={`/${Routes.Console}/login`}
                                exact
                                component={LoginView}
                              />
                              <Route
                                path={`/${Routes.Console}/finish-login`}
                                exact
                                component={FinishLogin}
                              />
                              <Route
                                path={`/${Routes.Console}`}
                                component={() => (
                                  <YardOperationConsole formContainer={mainRef.current} />
                                )}
                              />
                            </Switch>
                          </Route>

                          <ProtectedRoute
                            permissions="recycling:GradingInterface:perform"
                            path={`/${Routes.Grading}`}
                          >
                            <Switch>
                              <Route
                                path={`/${Routes.Grading}/login`}
                                exact
                                component={LoginView}
                              />
                              <Route
                                path={`/${Routes.Grading}/finish-login`}
                                exact
                                component={FinishLogin}
                              />
                              <Route
                                path={`/${Routes.Grading}`}
                                exact
                                component={GradingTabletList}
                              />
                              <Route
                                path={`/${Routes.Grading}/:orderId`}
                                component={GradingTabletDetails}
                              />
                            </Switch>
                          </ProtectedRoute>
                          <RedirectToLobby />
                        </Switch>
                      </main>
                    </div>
                    <SidePanels />
                    <Modals />
                  </PrintWeightTicketProvider>
                </ScaleProvider>
              </PrintNodeProvider>
            </Route>
          </Switch>
        </MaterialOrderContext.Provider>
      </IsLoggedIn>
    </>
  );
}

export default App;
