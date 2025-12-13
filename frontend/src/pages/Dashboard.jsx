import JobCardForm from './JobCardForm';
import JobCardList from './JobCardList';

export default function Dashboard(){
  const role = localStorage.getItem('role');

  return (
    <div>
      <h3>Dashboard ({role})</h3>

      {role === 'service_advisor' && <JobCardForm />}

      <JobCardList />
    </div>
  );
}
