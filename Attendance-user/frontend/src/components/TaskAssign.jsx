import React,{useState,useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ipadr,LS } from "../Utils/Resuse";
import { Modal } from "./Modal";
import { createPortal } from "react-dom";
import { toast,ToastContainer } from "react-toastify";


const TaskAssign=()=>{
     const [employeeData, setEmployeeData] = useState({});
     const [taskData,SetTaskData]=useState([]);
     const [loading, setLoading] = useState(false);
     const [error,setError]=useState();
     const [currentPage, setCurrentPage] = useState(1);
     const [itemsPerPage, setItemsPerPage] = useState(5);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectone,SetSelectone]=useState({});
    const [allselect,SetAllSelect]=useState({});
    const[tempdata,SetTempdata]=useState({});

    const[modeldata,setModelData]=useState({
        task:"",
        userid:"",
        date:"",
        due_date:"",
        TL:"",
    })
     

     useEffect(()=>{
       const fetchEmpdata= async()=>{
            try{
                setLoading(true);
                const response= await axios.get(`${ipadr}/get_team_members?TL=${LS.get("name")}`);
                const Empdata=response.data && Array.isArray(response.data)? response.data :[];
                console.log("data:",Empdata);
                setEmployeeData(Empdata);
                setLoading(false)
            }
            catch(error)
            {
                setLoading(false);
                setEmployeeData([]);
                 setError("Error while fetching");
            }
        }

        fetchEmpdata();

     },[])
     


      const handleChange = (e) => {
        const {name , checked} = e.target ;

        console.log(name);

        if(name == "allSelect") {
            
            let tempEmp = employeeData.map(item => {
                return {...item,isChecked: checked,category:name}
            }) ;
            console.log(tempEmp);
            SetAllSelect(tempEmp);
            setEmployeeData(tempEmp) ;
        }
        else { 
            console.log("SelectOne")
            let tempUser = employeeData.map(item => item.name === name ? {...item, isChecked: checked,category: "SelectOne"} : item);
            console.log(tempUser);
            let user= Object.assign(tempUser.filter(item=>item.category==="SelectOne"));
            console.log(user)
            SetSelectone(user);
            setEmployeeData(tempUser) ;
        }
    }

    const handleAllChange=(e,index,type)=>{
       const {name,value}=e.target

    //    console.log(name +"-"+ value);

       setModelData({ ...modeldata, [name]: value });
    }


    const handleButtonClick = (value) => {
        setModalOpen(false);
        
      };
      const today = new Date();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const year = today.getFullYear();
      const date = ("0" + today.getDate()).slice(-2);
      const currentDate = `${year}-${month}-${date}`;
      
      console.log(currentDate);

      const handleonSubmit=async(e)=>{
        
        console.log("Data:",selectone)
        
        
        if(selectone?.[0]?.category==="SelectOne")
        {
            const taskdetails={
                task:modeldata.task,
                userid:selectone?.[0]?.userid,
                TL:LS.get("name"),
                date: currentDate,
                due_date:modeldata.due_date,
    
            };
    
            console.log(taskdetails);
            
               
              const response=  await axios({
                    method: 'post',
                    url: `${ipadr}/manager_task_assign`,
                    data: taskdetails, 
                    headers: {
                     // 'Authorization': `bearer ${token}`,
                    'Content-Type': 'application/json'
                    }, 
                  })
    
                  if(response.statusText==='OK')
                  {
                     toast.success("Task Added successfully");
                     setModelData({
                        task:"",
                        userid:"",
                        TL:"",
                        parsed_date:"",
                        due_date:"",
                     })
                  }
                  else{
                    toast.error("error while Added the data");
                  }
        }
        else{
             
            console.log("allselect",allselect);
            let taskArr=[];
          for(let i=0;i<Object.keys(allselect).length;i++){
            
            let taskdetails={
                task:modeldata.task,
                userid:allselect?.[i]?.userid,
                TL:LS.get("name"),
                date: currentDate,
                due_date:modeldata.due_date,
                
             
            };
            console.log(taskdetails.userid);
            taskArr.push(taskdetails);
            
          
          }
          
          console.log(taskArr);
          SetTempdata(taskArr);
          console.log("temp:",tempdata);
          const response=  await axios({
            method: 'post',
            url: `${ipadr}/task_assign_to_multiple_members`,
            data:{Task_details:taskArr} , 
            headers: {
             // 'Authorization': `bearer ${token}`,
            'Content-Type': 'application/json'
            }, 
          })
           
          if(response.statusText==='OK')
            {
               toast.success(" Task for everyone is Added successfully");
               setModelData({
                  task:"",
                  userid:"",
                  TL:"",
                  parsed_date:"",
                  due_date:"",
               })
            }
            else{
              toast.error("error while Added the data");
            }


        }

       
        
              setModalOpen(false);

      }
 


     return(
        <div className="mr-8 p-10 bg-white min-h-96 lg:min-h-[90vh] w-full  shadow-black rounded-xl justify-center items-center relative jsonback  ml-10 rounded-md ">
            <div className="">
            <h1 className="text-5xl font-semibold font-inter pb-2 text-transparent bg-gradient-to-r from-zinc-600 to-zinc-950 bg-clip-text border-b-2">
              Task Assign  </h1>
              <div class="">
              <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg" onClick={() => setModalOpen(true)}>
                    Add Task
             </button>
             <Link to={`/User/viewtask`}>
                <div className="">
                   <button className="bg-blue-500 hover:bg-blue-400 hover:text-slate-900 text-white text-sm font-inter px-4 py-2 rounded-full shadow-lg absolute top-[95px] right-[10px] ">
                      View Tasks
                    </button>                                                           
                 </div>
              </Link> 
             {modalOpen &&
        createPortal(
          <Modal
            closeModal={handleButtonClick}
            onSubmit={handleonSubmit}
            onCancel={handleButtonClick}
          >
         {employeeData.map((item,index)=>(
            item.isChecked===true && item.category=="SelectOne" ?(
           <>
            <div>
                Assign Task for  {item.name}
            </div>
            <div key={index}>
             <label className="block mb-1">Task</label>
             <textarea
               name="task"
               value={modeldata.task}
               onChange={handleAllChange}
               className="w-full border border-gray-300 rounded px-3 py-2"
             ></textarea>
           </div>
           <div key={index}>
            <label className="block mb-1">Due date</label>
            <input 
               type="date"
                name="due_date"
                value={modeldata.due_date}
                onChange={handleAllChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                />
           </div>
            </>
            ):null
             
         ))}

         {employeeData.some((item) => item.isChecked === true && item.category === "allSelect") && (
            <div>
              <div>Assign Task for All</div>
              <div>
                <label className="block mb-1">Task</label>
                <textarea
                  name="task"
                  value={modeldata.task}
                  onChange={handleAllChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                ></textarea>
              </div>
              <div>
                <label className="block mb-1">Due date</label>
                <input
                  type="date"
                  value={modeldata.due_date}
                  name="due_date"
                  onChange={handleAllChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
          )}
          
         
          
          
          </Modal>,
          document.body
        )}

          </div>
        <div className="w-full bg-gradient-to-b from-white to-blue-50 shadow-lg rounded-xl border border-gray-200 my-2 mt-10">
            <div className="p-3">
                
                <div>
                    <table className="table-auto w-full overflow-y-auto">
                        <thead className="text-sm font-semibold uppercase text-black bg-[#6d9eeb7a]">
                            <tr>
                                <th scope="col" className="p-2 whitespace-nowrap">
                                    <div className="font-semibold text-center">S.No</div>
                                </th>
                                <th scope="col" className="p-2 whitespace-nowrap">
                                    <div className="font-semibold text-center">User Id</div>
                                </th>
                                <th scope="col" className="p-2 whitespace-nowrap">
                                    <div className="font-semibold text-center">Name</div>
                                </th>
                                <th scope="col" className="p-2 whitespace-nowrap">
                                    <div className="font-semibold text-center">Email</div>
                                </th>
                                 <th scope="col" className="p-2 whitespace-nowrap">
                                        <div className="font-semibold text-center">Department</div>
                                </th>
                                <th scope="col" className="p-2 whitespace-nowrap">
                                        <div className="font-semibold text-center">Position</div>
                                </th>
                                <th scope="col" className="p-2 whitespace-nowrap">
                                <input
                                 type="checkbox"
                                 className="form-check-input"
                                 name = "allSelect"
                                 onChange = {handleChange}
                                 />
                                 </th>
                            </tr>
                        </thead> 
                            <tbody  className="text-sm">
                                  {loading?(
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="p-2 whitespace-nowrap font-inter text-center">
                                        <div className="font-medium text-center">
                                            Loading...
                                        </div>
                                    </td>
                                </tr>
                                  ): employeeData.length>0 ?(
                                    employeeData.map((item,index)=>(
                                             <tr key={index}>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                        {index + 1 + (currentPage - 1) * itemsPerPage}.
                                                    </div>
                                                </td>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                        {item.userid || "N/A"}
                                                    </div>
                                                </td>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                        {item.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                        {item.email || "N/A"}
                                                    </div>
                                                </td>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                        {item.department || "N/A"}
                                                    </div>
                                                </td>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                        {item.position || "N/A"}
                                                    </div>
                                                </td>
                                                <td scope="col" className="p-2 whitespace-nowrap">
                                                    <div className="font-medium text-center">
                                                    <input
                                                        type="checkbox"
                                                        name={item.name}
                                                        checked={item.isChecked}
                                                        //  checked={selectedUsers.includes(item.id)}
                                                         onChange={ handleChange}
                                                         
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                    ))
                                      
                                  ): (
                                  <tr>
                                    <td colSpan="6" className="p-2 whitespace-nowrap">
                                        <div className="font-medium text-center">
                                              No employee available
                                        </div>
                                    </td>
                                </tr> 
                                  )

                                  }
                            </tbody>

                    
                </table>
                </div>
              </div>
              </div>
            </div>

        </div>
     )
}

export default TaskAssign;