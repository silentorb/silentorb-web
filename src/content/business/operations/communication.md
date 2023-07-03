# Communication

## Ephemeral and Persistent Information

* Information has varying degrees of relevance over time
* While those degrees of temporal relevance span a spectrum, it is practical to divide that spectrum into two categories: ephemeral and persistent
* Ephemeral information has immediate value and is rarely needed in the future
* Persistent information has significant long term value

## Streaming Communication Solutions

### Overview

* Streaming communication solutions are well suited for ephemeral information and impractical for persistent information

### Messaging

* Messaging applications are an excellent means of communicating ephemeral information
* Good messaging applications also maintain a history of messages, enabling searching for past communication when needed
* While message history provides a form of persistence, message history is not a practical substitute for dedicated persistent communication solutions
* The main reasons why messaging systems are impractical for persistent information is:
  * They contain significant noise and are not an optimal digest for old information
  * Message history is mostly immutable and cannot be practically refined and maintained
* Messaging is ideal for quick exchanges that are completed within a few minutes
* Messaging becomes less optimal as the length of a discussion increases

### Meetings

* For longer discussions, meetings are superior to messaging
* Meetings are the optimal method for batching topics, integrating collaborator input, and reaching consensus
* Meetings add a healthy personal touch to communication

#### Agendas

* Meetings with agendas are more efficient than meetings without agendas
* Depending on the topics and participants, some meetings are useless without an agenda

#### Meeting Persistence

* It can be useful to record meetings, but recordings are not a practical digest of information
* [Meeting notes](#documents) are a superior means of persisting meeting information

## Structured Communication Solutions

* Structured communication solutions are well suited for persistent information
* While many structured communication solutions include streaming communication features (such as comments), structured communication solutions are not well suited for ephemeral information as messaging applications and meetings are

### Documents

* Documents are one of the best means of communicating persistent information
* Documents value increases when documents are cross-linked
* The World Wide Web is built upon the paradigm of cross-linked documents
* Documentation needs maintenance in order to stay relevant and reliable

#### Commenting

* Most collaborative documentation solutions include a commenting feature
* Document comments are ephemeral—they are intended to be resolved and are not intended to store long-term information
* Persistent comments should be stored within the actual content of the document, using annotation styling when available
* Document comments are inefficient for initial document composition—meetings are a superior method of integrating initial input from multiple people
* Once a document is established and only periodically updated, document comments are much more useful, where the comments can act as deferred tickets that may not need immediate resolution but are tagged to the document so they aren't forgotten

### Issue Tracking Software

* Issues are a middle ground between ephemeral and perpetual information, in that issue relevance usually persists longer than a message, but issues are still intended to be ultimately resolved and closed
* Issue tracking software is not well suited for Information that is intended to be indefinitely relevant
  * For such information, a document is superior
* Unlike messaging applications, issue tracking software employs a more structured, cross-linked data model, resulting in superior management and reporting of historical data than messaging applications provide

#### Commenting

* Like documentation solutions, issue tracking software usually includes a feature where users can comment on issues
* For a new team, it is usually impractical to rely heavily on issue comments
* As a team grows and becomes more established, it is usually more efficient to move much of the communication from messaging applications to issue comments
  * This way, discussions become closely associated with the issues they relate to, resulting in better grouping and management of ephemeral information
* The transition to relying more on issue comments is dependent on critical mass—the more team members comment on issues the more worthwhile it becomes to watch issues and keep track of issue comments

## Participant Optimization

* With the advent of the information age, it has become increasingly easy to get drowned by noise
* Conversely, with the advent of the information age, one of the greatest challenges is finding the information that is needed
* For each communication forum within an organization, there is a delicate balance in selecting the participants of that forum
* When people who are not needed are participants in a forum, it adds unnecessary noise to their work and wastes their time
  * When those people are also vocal within that forum, other people's time is wasted as well
* When a forum lacks essential participants, time is wasted for everyone within that forum and everyone dependent on the output of that forum

| [Previous: Organization](./organization.md) | [Index](../tech-company-business-strategy.md) | [Benevolence](../benevolence.md) |
| :-----------------------------------------: | :-------------------------------------------: | :------------------------------: |