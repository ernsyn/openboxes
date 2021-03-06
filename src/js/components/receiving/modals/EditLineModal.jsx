import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Translate } from 'react-localize-redux';

import ModalWrapper from '../../form-elements/ModalWrapper';
import ArrayField from '../../form-elements/ArrayField';
import TextField from '../../form-elements/TextField';
import DateField from '../../form-elements/DateField';
import SelectField from '../../form-elements/SelectField';
import CheckboxField from '../../form-elements/CheckboxField';
import { showSpinner, hideSpinner } from '../../../actions';
import apiClient from '../../../utils/apiClient';

const FIELDS = {
  lines: {
    type: ArrayField,
    // eslint-disable-next-line react/prop-types
    addButton: ({ addRow, shipmentItemId }) => (
      <button
        type="button"
        className="btn btn-outline-success btn-xs"
        onClick={() => addRow({
          shipmentItemId,
          receiptItemId: null,
          newLine: true,
        })}
      ><Translate id="default.button.addLine.label" />
      </button>
    ),
    getDynamicRowAttr: ({ rowValues }) => ({
      className: rowValues.remove ? 'crossed-out' : '',
    }),
    fields: {
      remove: {
        type: CheckboxField,
        label: '',
        attributes: {
          custom: true,
        },
      },
      product: {
        type: SelectField,
        label: 'product.label',
        fieldKey: 'disabled',
        attributes: {
          className: 'text-left',
          async: true,
          openOnClick: false,
          autoload: false,
          filterOptions: options => options,
          cache: false,
          options: [],
          showValueTooltip: true,
        },
        getDynamicAttr: ({ fieldValue, productsFetch }) => ({
          disabled: fieldValue,
          loadOptions: _.debounce(productsFetch, 500),
        }),
      },
      lotNumber: {
        type: TextField,
        label: 'stockMovement.lot.label',
      },
      expirationDate: {
        type: DateField,
        label: 'stockMovement.expiry.label ',
        attributes: {
          dateFormat: 'MM/DD/YYYY',
          autoComplete: 'off',
        },
      },
      quantityShipped: {
        type: TextField,
        label: 'stockMovement.quantityShipped.label',
        attributes: {
          type: 'number',
        },
      },
    },
  },
};

function validate(values) {
  const errors = {};
  errors.lines = [];

  _.forEach(values.lines, (line, key) => {
    if (line && _.isNil(line.quantityShipped)) {
      errors.lines[key] = { quantityShipped: 'error.enterQuantityShipped.label' };
    }
    if (line.quantityShipped < 0) {
      errors.lines[key] = { quantityShipped: 'error.quantityShippedNegative.label' };
    }
  });

  return errors;
}

/**
 * Modal window where user can edit receiving's line. User can open it on the first page
 * of partial receiving if they want to change lot information.
*/
class EditLineModal extends Component {
  constructor(props) {
    super(props);
    const {
      fieldConfig: { attributes, getDynamicAttr },
    } = props;
    const dynamicAttr = getDynamicAttr ? getDynamicAttr(props) : {};
    const attr = { ...attributes, ...dynamicAttr };

    this.state = {
      attr,
      formValues: [],
    };

    this.onOpen = this.onOpen.bind(this);
    this.onSave = this.onSave.bind(this);
    this.productsFetch = this.productsFetch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      fieldConfig: { attributes, getDynamicAttr },
    } = nextProps;
    const dynamicAttr = getDynamicAttr ? getDynamicAttr(nextProps) : {};
    const attr = { ...attributes, ...dynamicAttr };

    this.setState({ attr });
  }

  /**
   * Loads available items into modal's form.
   * @public
  */
  onOpen() {
    this.setState({
      formValues: {
        lines: _.map([this.state.attr.fieldValue], value => ({
          ...value,
          product: {
            ...value.product,
            label: `${_.get(value, 'product.productCode')} - ${_.get(value, 'product.name')}`,
          },
          disabled: true,
          originalLine: true,
        })),
      },
    });
  }

  /**
   * Sends all changes made by user in this modal to API and updates data.
   * @param {object} values
   * @public
   */
  onSave(values) {
    this.state.attr.saveEditLine(
      values.lines,
      this.state.attr.parentIndex,
      this.state.attr.rowIndex,
    );
  }

  productsFetch(searchTerm, callback) {
    if (searchTerm) {
      apiClient.get(`/openboxes/api/products?name=${searchTerm}&productCode=${searchTerm}&location.id=${this.props.locationId}`)
        .then(result => callback(
          null,
          {
            complete: true,
            options: _.map(result.data.data, obj => (
              {
                value: {
                  id: obj.id,
                  name: obj.name,
                  productCode: obj.productCode,
                  label: `${obj.productCode} - ${obj.name}`,
                },
                label: `${obj.productCode} - ${obj.name}`,
              }
            )),
          },
        ))
        .catch(error => callback(error, { options: [] }));
    } else {
      callback(null, { options: [] });
    }
  }

  render() {
    return (
      <ModalWrapper
        {...this.state.attr}
        onOpen={this.onOpen}
        onSave={this.onSave}
        validate={validate}
        initialValues={this.state.formValues}
        fields={FIELDS}
        formProps={{
          shipmentItemId: this.state.attr.fieldValue.shipmentItemId,
          productsFetch: this.productsFetch,
        }}
      />
    );
  }
}

export default connect(null, { showSpinner, hideSpinner })(EditLineModal);

EditLineModal.propTypes = {
  /** Name of the field */
  fieldName: PropTypes.string.isRequired,
  /** Configuration of the field */
  fieldConfig: PropTypes.shape({
    getDynamicAttr: PropTypes.func,
  }).isRequired,
  /** Function called when data is loading */
  showSpinner: PropTypes.func.isRequired,
  /** Function called when data has loaded */
  hideSpinner: PropTypes.func.isRequired,
  /** Index  of current row */
  rowIndex: PropTypes.number.isRequired,
  /** Location ID (destination). Needs to be used in /api/products request. */
  locationId: PropTypes.string.isRequired,
};
