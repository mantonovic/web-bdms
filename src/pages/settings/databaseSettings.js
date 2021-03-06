import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import {
  Button,
  Divider,
  Header,
  Message,
  // Input,
  Segment,
  // Dropdown,
  Form,
  Radio,
} from 'semantic-ui-react';

import WorkgroupRadioGroup from '../../commons/form/workgroup/radio';
import WorkgroupMultiselect from '../../commons/form/workgroup/multi';
import SupplierRadioGroup from '../../commons/form/supplier/radio';
import TranslationText from '../../commons/form/translationText';

import {
  exportDatabase,
  importDatabaseWorkgroup,
  importDatabaseSupplier,
  importDatabaseNewSupplier,
  listWorkgroups,
  getWorkgroups,
  reloadUser,
} from '@ist-supsi/bmsjs';

class DatabaseSettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      export: false,
      exportWorkgroup: [],
      // enabledWorkgroups: props.user.data.workgroups.filter(
      //   w => w.disabled === null && w.supplier === false
      // ),
      enabledWorkgroups: [],
      importWorkgroup: null,
      importSupplier: null,
      importType: 'existingWorkgroup',
      file: null,
      supplierName: '',
      suppliers: [],
      supplier: null,

      exporting: false,
      importing: false,
    };
    this.countExportableBoreholes = this.countExportableBoreholes.bind(this);
  }

  componentDidMount(){
    this.reset();
  }

  reset(){

    getWorkgroups().then(
      r => {
        if (r.data.success === true) {
          this.setState({
            export: false,
            exportWorkgroup: [],
            enabledWorkgroups: r.data.data.filter(
              w => w.disabled === null
            ),
            importWorkgroup: null,
            importSupplier: null,
            importType: 'existingWorkgroup',
            file: null,
            supplierName: '',
            suppliers: r.data.data.filter(
              w => w.supplier === true
            ),
            supplier: null,

            exporting: false,
            importing: false,
          });
        } else {

          this.setState({
            export: false,
            exportWorkgroup: [],
            enabledWorkgroups: [],
            importWorkgroup: null,
            importSupplier: null,
            importType: 'existingWorkgroup',
            file: null,
            supplierName: '',
            suppliers: [],
            supplier: null,

            exporting: false,
            importing: false,
          });
        }
      }
    );


    // listSuppliers().then(
    //   r => {
    //     if (r.data.success === true) {
    //       this.setState({
    //         export: false,
    //         exportWorkgroup: 'all',
    //         enabledWorkgroups: this.props.user.data.workgroups.filter(
    //           w => w.disabled === null
    //         ),
    //         importWorkgroup: null,
    //         importSupplier: null,
    //         importType: 'existingWorkgroup',
    //         file: null,
    //         supplierName: '',
    //         suppliers: r.data.data,
    //         supplier: null,

    //         exporting: false,
    //         importing: false,
    //       });
    //     } else {

    //       this.setState({
    //         export: false,
    //         exportWorkgroup: 'all',
    //         enabledWorkgroups: this.props.user.data.workgroups.filter(
    //           w => w.disabled === null
    //         ),
    //         importWorkgroup: null,
    //         importSupplier: null,
    //         importType: 'existingWorkgroup',
    //         file: null,
    //         supplierName: '',
    //         suppliers: [],
    //         supplier: null,

    //         exporting: false,
    //         importing: false,
    //       });
    //     }
    //   }
    // );
  }

  countExportableBoreholes () {
    const {
      enabledWorkgroups,
      exportWorkgroup
    } = this.state;

    if (exportWorkgroup.length === 0) {
      return 0;
    }
    const selected = enabledWorkgroups.filter(
      w => exportWorkgroup.indexOf(w.id) > -1
    );
    let total = 0;
    selected.forEach(el => {
      total += el.boreholes;
    });
    return total;
  }

  render() {
    const {
      t
    } = this.props;
    return (
      <div
        style={{
          padding: '2em',
          flex: 1
        }}
      >
        <div
          style={{
            flexDirection: 'row',
            display: 'flex'
          }}
        >
          <Header
            as='h3'
            className='link'
            onClick={() => {
              this.setState({
                "export": !this.state.export
              });
            }}
            style={{
              margin: '0px'
            }}
          >
            Export
          </Header>
          <div
            style={{
              flex: 1,
              textAlign: 'right'
            }}
          >
            <Button
              color='red'
              onClick={() => {
                this.setState({
                  "export": !this.state.export
                });
              }}
              size='small'
            >
              {
                this.state.export === true ?
                  t('collapse') : t('expand')
              }
            </Button>
          </div>
        </div>
        {
          this.state.export === true ?
            <Segment>
              <WorkgroupMultiselect
                nameKey='name'
                onChange={
                  workgroup => {
                    this.setState({
                      'exportWorkgroup': workgroup
                    });
                  }
                }
                // workgroups={this.props.user.data.workgroups}
                workgroups={this.state.enabledWorkgroups}
              />
              <div
                style={{
                  // textAlign: 'center'
                  marginTop: '1.5em',
                }}
              >
                <Button
                  disabled={
                    this.state.exporting === true
                    || this.state.exportWorkgroup.length === 0
                  }
                  loading={this.state.exporting === true}
                  onClick={() => {
                    this.setState({
                      exporting: true,
                    }, () => {
                      exportDatabase(
                        this.state.exportWorkgroup
                      ).then(
                        response => {
                          if (response.success === false) {
                            alert(response.message);
                          }
                          this.reset();
                        }
                      );
                    });
                  }}
                  primary
                  size='small'
                >
                  Export &nbsp;
                  ({this.countExportableBoreholes()}
                  &nbsp;
                  <TranslationText
                    id='boreholes'
                  />)
                </Button>
              </div>
            </Segment>: <Divider />
        }
        <div
          style={{
            flexDirection: 'row',
            display: 'flex'
          }}
        >
          <Header
            as='h3'
            className='link'
            onClick={() => {
              this.setState({
                "restore": !this.state.restore
              });
            }}
            style={{
              margin: '0px'
            }}
          >
            Import
          </Header>
          <div
            style={{
              flex: 1,
              textAlign: 'right'
            }}
          >
            <Button
              color='red'
              onClick={() => {
                this.setState({
                  "restore": !this.state.restore
                });
              }}
              size='small'
            >
              {
                this.state.restore === true ?
                  t('collapse') : t('expand')
              }
            </Button>
          </div>
        </div>
        {
          this.state.restore === true ?
            <Segment>
              <div
                style={{
                  marginBottom: '1em',
                  padding: '1em',
                }}
              >
                <Form>
                  <Form.Field>
                    <Radio
                      checked={this.state.importType === 'existingWorkgroup'}
                      label='Add to an existing regular workgroup (data can be edited later):'
                      name='radioGroup'
                      onChange={() => this.setState({ importType: 'existingWorkgroup' })}
                      value='existingWorkgroup'
                    />
                  </Form.Field>
                  <Form.Field>
                    <Radio
                      checked={this.state.importType === 'newSupplier'}
                      label='Import into a new "supplier" workgroup:'
                      name='radioGroup'
                      onChange={() => this.setState({ importType: 'newSupplier' })}
                      value='newSupplier'
                    />
                  </Form.Field>
                  {
                    this.state.suppliers.length > 0?
                      <Form.Field>
                        <Radio
                          checked={this.state.importType === 'existingSupplier'}
                          label='⚠️ Delete and rewrite the data into an existing "supplier" workgroup:'
                          name='radioGroup'
                          onChange={() => this.setState({ importType: 'existingSupplier' })}
                          value='existingSupplier'
                        />
                      </Form.Field>: null
                  }
                </Form>
                {
                  this.state.importType === 'newSupplier'?
                    <Message info>
                      <Message.Header>Information</Message.Header>
                      <p>
                        You are creating a new "supplier" workgroup. Imported
                        data will be read only. And you will be able only
                        to decide if make them public or not. 
                      </p>
                    </Message>: null
                }
                {
                  this.state.importType === 'existingSupplier'?
                    <Message warning>
                      <Message.Header>Warning!</Message.Header>
                      <p>
                        Importing into an existing supplier workgroup,
                        will delete and replace all previously uploaded data. 
                      </p>
                    </Message>: null
                }
                {
                  this.state.importType === 'existingWorkgroup'?
                    <Message info>
                      <Message.Header>Information</Message.Header>
                      <p>
                        You are adding data to a regular workgroup. Using this option
                        all the data will be editable as normally inserted. 
                      </p>
                    </Message>: null
                }
                <Segment>
                  {
                    this.state.importType === 'newSupplier'?
                      <div>
                        <Form.Input
                          fluid
                          label='Supplier name'
                          onChange={(e)=>{
                            this.setState({
                              supplierName: e.target.value
                            });
                          }}
                          placeholder={t('workgroup')}
                          value={this.state.supplierName}
                        />
                      </div>: null
                  }
                  {
                    this.state.importType === 'existingSupplier'?
                      <div>
                        <div
                          className="flex_fill"
                          style={{
                            paddingLeft: '1em'
                          }}
                        >
                          <SupplierRadioGroup
                            filter={this.state.importSupplier}
                            onChange={
                              supplier => {
                                this.setState({
                                  'importSupplier': supplier
                                });
                              }
                            }
                            suppliers={this.state.suppliers}
                          />
                        </div>
                      </div>: null
                  }
                  {
                    this.state.importType === 'existingWorkgroup'?
                      <div>
                        <div
                          className="flex_fill"
                          style={{
                            paddingLeft: '1em'
                          }}
                        >
                          <WorkgroupRadioGroup
                            all={false}
                            filter={this.state.importWorkgroup}
                            nameKey='name'
                            onChange={
                              workgroup => {
                                this.setState({
                                  'importWorkgroup': workgroup
                                });
                              }
                            }
                            workgroups={
                              this.state.enabledWorkgroups.filter(
                                w => w.supplier === false
                              )
                            }
                          />
                        </div>
                      </div>: null
                  }
                  <input
                    onChange={(e)=>{
                      this.setState({
                        file: e.target.files[0]
                      });
                    }}
                    ref={e => this.input = e}
                    style={{
                      fontFamily: 'inherit'
                    }}
                    type='file'
                  />
                  <div
                    style={{
                      // textAlign: 'center'
                      marginTop: '1.5em',
                    }}
                  >
                    <Button
                      disabled={
                        this.state.importing === true ||
                        !this.state.file || (
                          (
                            this.state.importType === 'newSupplier' &&
                            !this.state.supplierName
                          ) || (
                            this.state.importType === 'existingSupplier' &&
                            !this.state.importSupplier
                          ) || (
                            this.state.importType === 'existingWorkgroup' &&
                            !this.state.importWorkgroup
                          )
                        )
                      }
                      loading={this.state.importing === true}
                      negative={this.state.importType === 'existingSupplier'}
                      onClick={() => {
                        this.setState({
                          importing: true,
                        }, () => {
                          if (this.state.importType === 'newSupplier') {
                            importDatabaseNewSupplier(
                              this.state.supplierName, this.state.file
                            ).then(
                              response => {
                                this.reset();
                                this.props.reloadUser();
                              }
                            );
                          } else if (this.state.importType === 'existingSupplier') {
                            importDatabaseSupplier(
                              this.state.importSupplier, this.state.file
                            ).then(
                              response => {
                                this.reset();
                              }
                            );
                          } else if (this.state.importType === 'existingWorkgroup') {
                            importDatabaseWorkgroup(
                              this.state.importWorkgroup, this.state.file
                            ).then(
                              response => {
                                this.reset();
                              }
                            );
                          }
                        });
                      }}
                      primary={this.state.importType !== 'existingSupplier'}
                      size='small'
                    >
                      Import
                    </Button>
                  </div>
                </Segment>
              </div>
            </Segment>: <Divider />
        }
      </div>
    );
  }
};

DatabaseSettings.propTypes = {
  listWorkgroups: PropTypes.func,
  reloadUser: PropTypes.func,
  t: PropTypes.func,
  workgroups: PropTypes.object
};

// DatabaseSettings.defaultProps = {
// };

const mapStateToProps = (state) => {
  return {
    user: state.core_user,
    workgroups: state.core_workgroups,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch: dispatch,
    reloadUser: () => {
      dispatch(reloadUser());
    },
    listWorkgroups: (ru=false) => {
      return dispatch(listWorkgroups());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation(['common'])(DatabaseSettings));
