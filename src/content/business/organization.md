# Organization

## Roles

### Definition

* A role is a distinct collection of responsibilities
* A role usually includes some authority in order to fulfill those responsibilities
* A role can sometimes include honor and respect
* Every entity, be it an individual or a group, can have one or more roles

### Motivation

* Roles are essential for collaboration
* Roles set expectations between collaborators
* When roles are formalized, people can know what to expect from others before they even meet
* Poorly defined roles results in confusion and inefficiency
* Roles act as interfaces, where the holder a role acts as an implementer of that roles
  * This abstraction allows for smoother exchange and reassignment of roles

## Departments

### Definition

* Personnel within an organization are grouped together into departments
* Departments are partitioned by domain, with each department representing a particular domain

### Unity

* It is easy for departments to become islands that are overly disconnected from the other departments
* Organizations large enough to have multiple departments need operations personnel to bridge the gap between departments

## Channels

### Production Pipelines

* Production is a pipeline
* The departments and individuals of a production pipeline form a cyclic [dependency graph](https://en.wikipedia.org/wiki/Dependency_graph)
* The start up the pipeline is "upstream"
* The end of the pipeline is "downstream"

### Deliverables

* Most collaboration can be defined in terms of deliverables
* Deliverables are passed along the pipeline from dependencies to dependents
* Examples:
  * UI Designers deliver UI designs to developers
  * Developers deliver partially tested code to QA testers
  * QA testers delivers more comprehensively tested code to distributors
* The production dependency graph is cyclic at both micro levels and macro levels
  * It is cyclic at a micro level because various steps in the process have tight loops
    * For example, while part of the pipeline is roughly `Dev` => `QA` => `Dist`, when QA finds any bugs, it will pass bug tickets back to the developers
  * It is cyclic at the macro level because once a product is finished it is passed back up the pipeline and delivered to customers and clients by upstream personnel
    * In some cases it is only a partially upstream delivery, where upstream personnel are notifying customers of new software updates

### Routing by Role

* Much of collaboration consists of routing concerns
* [Roles](#roles) streamline concern-routing by making it obvious to whom and through whom a concern should be routed

### Problem Flow

* Most particular problems flow downward, not upward
* Upstream problems can cripple downstream productivity

---

| [Previous: Execution](./execution.md) | [Index](./tech-company-business-strategy.md) | [Loop: Appraisal](./appraisal.md) |
| :-----------------------------------: | :------------------------------------------: | :-------------------------------: |
