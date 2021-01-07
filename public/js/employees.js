const Employees = () => {
    useEffect(()=>{
        fetchDetail();
    }, []);

    const [items, setItems] = useState([]);

    const fetchDetail = async () => {
        var data = await ( await fetch('/data/employees') ).json();
        console.log(data);
        setItems(data)
    };

    return (
        <table striped="true" bordered="true" hover="true" className="table">
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">First Name</th>
                    <th scope="col">Last Name</th>
                    <th scope="col">Birth Date</th>
                </tr>
            </thead>
            <tbody>
            {items.map( (item, i) => (
                <tr key={i}>
                    <td scope="row">{item.emp_id}</td>
                    <td scope="row">{item.firstname}</td>
                    <td scope="row">{item.lastname}</td>
                    <td scope="row">{item.birthdate}</td>
                </tr>
            ))
                
            }
            </tbody>
        </table>
    );
}