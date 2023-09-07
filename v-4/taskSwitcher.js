const tasks = document.getElementsByClassName("task");
switchTask("task2");
function switchTask(taskId){
    for (let i = 0; i < tasks.length; i++) {
        if(tasks[i].id !== taskId){
            tasks[i].style.display = 'none';
        }else{
            tasks[i].style.display = '';
        }
    }
}