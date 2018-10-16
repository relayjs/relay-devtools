import {connect} from 'react-redux';
import EditVariables from '../components/EditVariables';

const mapStateToProps = ({environments, updatesView}) => ({
  updatesView,
  environmentList: environments.environmentList,
});
const mapDispatchToProps = dispatch => ({
  loadEnvironment: () => {
    dispatch({
      types: [
        'LOAD_ENVIRONMENT_REQUEST',
        'LOAD_ENVIRONMENT_SUCCESS',
        'LOAD_ENVIRONMENT_FAILURE',
      ],
      callAPI: API => API.getEnvironment(),
    });
  },
  // subscribeEnvironment: environment => {
  //   dispatch({
  //     type: 'ENVIRONMENT_SUBSCRIBE',
  //     environment,
  //   });
  // },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(EditVariables);
