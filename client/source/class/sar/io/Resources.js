/* ************************************************************************

   Copyright:
     2023 IT'IS Foundation, https://itis.swiss

   License:
     MIT: https://opensource.org/licenses/MIT

   Authors:
     * Odei Maiz (odeimaiz)

************************************************************************ */

/**
 * Class that defines all the endpoints of the API to get the application resources. It also offers some convenient methods
 * to get them. It stores all the data in {osparc.store.Store} and consumes it from there whenever it is possible. The flag
 * "useCache" must be set in the resource definition.
 *
 * *Example*
 *
 * Here is a little example of how to use the class. For making calls that will update or add resources in the server,
 * such as POST and PUT calls. You can use the "fetch" method. Let's say you want to modify a study using POST.
 *
 * <pre class='javascript'>
 *   const params = {
 *     url: { // Params for the URL
 *       studyId
 *     },
 *     data: { // Payload
 *       studyData
 *     }
 *   }
 *   osparc.data.Resources.post("trainingSetGeneration", "getOne", params)
 *     .then(study => {
 *       // study contains the new updated study
 *       // This code will execute if the call succeeds
 *     })
 *     .catch(err => {
 *       // Treat the error. This will execute if the call fails.
 *     });
 * </pre>
 */


qx.Class.define("sar.io.Resources", {
  extend: qx.core.Object,
  type: "singleton",

  defer: function(statics) {
    statics.resources = {
      /*
       * Training Set Generation
       */
      "trainingSetGeneration": {
        endpoints: {
          generate: {
            method: "POST",
            url: "/training-set-generation/generate"
          },
          xport: {
            method: "GET",
            url: "/training-set-generation/xport"
          },
          getData: {
            method: "GET",
            url: "/training-set-generation/data"
          },
          getDistribution: {
            method: "GET",
            url: "/training-set-generation/distribution"
          },
          resetData: {
            method: "GET",
            url: "/training-set-generation/reset"
          },
        }
      },
      /*
       * Load Training Data
       */
      "trainingData": {
        endpoints: {
          load: {
            method: "POST",
            url: "/training-data/load"
          },
          resetData: {
            method: "GET",
            url: "/training-data/reset"
          },
        }
      },
      /*
       * Analysis & Creation
       */
      "analysisCreation": {
        endpoints: {
          create: {
            method: "POST",
            url: "/analysis-creation/create"
          },
          xport: {
            method: "POST",
            url: "/analysis-creation/xport"
          },
          getSemivariogram: {
            method: "GET",
            url: "/analysis-creation/variogram"
          },
          getMarginals: {
            method: "GET",
            url: "/analysis-creation/marginals"
          },
          getDeviations: {
            method: "GET",
            url: "/analysis-creation/deviations"
          },
          getReport: {
            method: "GET",
            url: "/analysis-creation/pdf"
          },
          resetData: {
            method: "GET",
            url: "/analysis-creation/reset"
          },
        }
      },
      /*
       * Load Model
       */
      "loadModel": {
        endpoints: {
          load: {
            method: "POST",
            url: "/model/load"
          },
          resetData: {
            method: "GET",
            url: "/model/reset"
          },
        }
      },
      /*
       * Test Set Generation
       */
      "testSetGeneration": {
        endpoints: {
          generate: {
            method: "POST",
            url: "/test-set-generation/generate"
          },
          xport: {
            method: "GET",
            url: "/test-set-generation/xport"
          },
          getData: {
            method: "GET",
            url: "/test-set-generation/data"
          },
          getDistribution: {
            method: "GET",
            url: "/test-set-generation/distribution"
          },
          resetData: {
            method: "GET",
            url: "/test-set-generation/reset"
          },
        }
      },
      /*
       * Load Test Data
       */
      "testData": {
        endpoints: {
          load: {
            method: "POST",
            url: "/test-data/load"
          },
          resetData: {
            method: "GET",
            url: "/test-data/reset"
          },
        }
      },
      /*
       * Confirm Model
       */
      "confirmModel": {
        endpoints: {
          confirm: {
            method: "GET",
            url: "/confirm-model/confirm"
          },
          getQQPlot: {
            method: "GET",
            url: "/confirm-model/qqplot"
          },
          getDeviations: {
            method: "GET",
            url: "/confirm-model/deviations"
          },
          getSemivariogram: {
            method: "GET",
            url: "/confirm-model/semivariogram"
          },
          getReport: {
            method: "GET",
            url: "/confirm-model/pdf"
          },
        }
      },
      /*
       * Search Space
       */
      "searchSpace": {
        endpoints: {
        }
      },
      /*
       * Load Critical Data
       */
      "criticalData": {
        endpoints: {
          load: {
            method: "POST",
            url: "/critical-data/load"
          },
          resetData: {
            method: "GET",
            url: "/critical-data/reset"
          },
        }
      },
      /*
       * Verify
       */
      "verify": {
        endpoints: {
        }
      },
    }
  },

  statics: {
    fetch: function(resource, endpoint, params, options = {}) {
      return this.getInstance().fetch(resource, endpoint, params, options);
    },

    getEndPoints: function(resourceName) {
      return this.getInstance().getEndPoints(resourceName);
    }
  },

  members: {
    /**
     * Method to fetch resources from the server. If configured properly, the resources in the response will be cached in {osparc.store.Store}.
     * @param {String} resource Name of the resource as defined in the static property 'resources'.
     * @param {String} endpoint Name of the endpoint. Several endpoints can be defined for each resource.
     * @param {Object} params Object containing the parameters for the url and for the body of the request, under the properties 'url' and 'data', respectively.
     * @param {Object} options Collections of options
     */
    fetch: function(resource, endpoint, params = {}, options = {}) {
      return new Promise((resolve, reject) => {
        if (this.self().resources[resource] == null) {
          reject(Error(`Error while fetching ${resource}: the resource is not defined`));
        }

        const resourceDefinition = this.self().resources[resource];
        const res = new qx.io.rest.Resource(resourceDefinition.endpoints);
        res.configureRequest(request => {
          const headers = [{
            key: "Accept",
            value: "application/json"
          }];
          headers.forEach(item => request.setRequestHeader(item.key, item.value));
          request.setRequestHeader("Content-Type", "application/json;text/csv;image/png");
        });

        // OM: get routes properly
        /*
        const endPointExists = Object.keys(res.__routes__P_172_2).includes(endpoint);
        if (!endPointExists) {
          reject(Error(`Error while fetching ${resource}: the endpoint is not defined`));
        }
        */

        res.addListenerOnce(endpoint + "Success", e => {
          const response = e.getRequest().getResponse();
          resolve(response);
          res.dispose();
        }, this);

        res.addListenerOnce(endpoint + "Error", e => {
          let message = null;
          let status = null;
          if (e.getData().error) {
            const logs = e.getData().error.logs || null;
            if (logs && logs.length) {
              message = logs[0].message;
            }
            status = e.getData().error.status;
          } else {
            const req = e.getRequest();
            message = req.getResponse();
            status = req.getStatus();
          }
          res.dispose();
          const err = Error(message ? message : `Error while trying to fetch ${endpoint} ${resource}`);
          if (status) {
            err.status = status;
          }
          reject(err);
        });

        res[endpoint](params.url || null, params.data || null);
      });
    },

    getEndPoints: function(resourceName) {
      return this.self().resources[resourceName].endpoints;
    },
  }
});
