/**
 * @fileOverview Contains the save rest class code.
 * @author  David Neilsen <david@panmedia.co.nz>
 * @author  Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

/**
 * @class Thes save rest class.
 * @constructor
 * @augments RaptorPlugin
 *
 * @param {type} name
 * @param {type} overrides Options hash.
 * @returns {SaveRestPlugin}
 */
function SaveRestPlugin(name, overrides) {
    this.method = 'put';
    RaptorPlugin.call(this, name || 'saveRest', overrides);
}

SaveRestPlugin.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Initializes the save rest plugin.
 *
 * @returns {Element}
 */
// <strict>
SaveRestPlugin.prototype.init = function() {
    if (typeof this.options.url !== 'string' && !$.isFunction(this.options.url)) {
        handleError('Expected save REST URL option to be a string or a function.');
    }
    if (!$.isFunction(this.options.data)) {
        handleError('Expected save REST data option to be a function.');
    }
};
// </strict>

/**
 * Saves the selection.
 */
SaveRestPlugin.prototype.save = function() {
    this.requests = 0;
    this.errors = [];
    this.messages = [];
    this.raptor.unify(function(raptor) {
        if (raptor.isDirty()) {
            this.requests++;
            var xhr = raptor.getPlugin('saveRest').sendRequest();
            xhr.raptor = raptor;
            xhr
                .done(this.done.bind(this))
                .fail(this.fail.bind(this))
                .always(this.always.bind(this));
        }
    }.bind(this));
};

/**
 * @todo this confuses me greatly, could you please do it?
 * @param {type} data
 * @param {type} status
 * @param {type} xhr
 */
SaveRestPlugin.prototype.done = function(data, status, xhr) {
    xhr.raptor.saved();
    this.messages.push(data);
};

/**
 * @todo same with this one
 * @param {type} xhr
 * @returns {undefined}
 */
SaveRestPlugin.prototype.fail = function(xhr) {
    this.errors.push(xhr.responseText);
};

/**
 * @todo and this one
 * @returns {undefined}
 */
SaveRestPlugin.prototype.always = function() {
    this.requests--;
    if (this.requests === 0) {
        if (this.errors.length > 0 && this.messages.length === 0) {
            this.raptor.showError(_('saveRestFail', {
                failed: this.errors.length
            }));
        } else if (this.errors.length > 0) {
            this.raptor.showError(_('saveRestPartial', {
                saved: this.messages.length,
                failed: this.errors.length
            }));
        } else {
            this.raptor.showConfirm(_('saveRestSaved', {
                saved: this.messages.length
            }), {
                delay: 1000,
                hide: function() {
                    this.raptor.unify(function(raptor) {
                        raptor.disableEditing();
                        raptor.hideLayout();
                    });
                }.bind(this)
            });
        }
    }
};

/**
 * @todo and this one
 * @returns {unresolved}
 */
SaveRestPlugin.prototype.sendRequest = function() {
    var headers = this.raptor.getPlugin('saveRest').getHeaders(),
        data = this.raptor.getPlugin('saveRest').getData(),
        url = this.raptor.getPlugin('saveRest').getURL();
    return $.ajax({
        type: this.options.type || 'post',
        dataType: this.options.dataType || 'json',
        headers: headers,
        data: data,
        url: url
    });
};

/**
 * @todo and this one
 * @returns {SaveRestPlugin.prototype.getHeaders.Anonym$5}
 */
SaveRestPlugin.prototype.getHeaders = function() {
    if (this.options.headers) {
        return this.options.headers.call(this);
    }
    return {};
};

/**
 * @todo and this one
 * @returns {SaveRestPlugin.prototype.getData.data}
 */
SaveRestPlugin.prototype.getData = function() {
    // Get the data to send to the server
    var content = this.raptor.getHtml(),
        data = this.options.data.call(this, content);
    data._method = this.method;
    return data;
};

/**
 * @todo and this one 
 * @returns {unresolved}
 */
SaveRestPlugin.prototype.getURL = function() {
    if (typeof this.options.url === 'string') {
        return this.options.url;
    }
    return this.options.url.call(this);
};

Raptor.registerPlugin(new SaveRestPlugin());
